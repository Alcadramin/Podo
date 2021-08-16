const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const contentSecurityPolicy = require('helmet-csp');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const express = require('express');
const { json, urlencoded } = require('express');
const redis = require('redis');

const { BotEvent, Embed } = require('../../lib');
const userModel = require('../../lib/models/User');
const submissionModel = require('../../lib/models/SubmissionHooks');
const logHander = require('../..//web/middlewares/logHandler');
const errorHandler = require('../../web/middlewares/errorHandler');
const notFound = require('../../web/middlewares/notFound');
const mountRoutes = require('../../web/endpoints/index');
require('dotenv').config();

module.exports = class Ready extends BotEvent {
  constructor() {
    super('ready');
  }

  async run(bot) {
    await bot.user.setPresence({
      activity: {
        name: `${bot.users.cache.size} users!`,
        type: 'WATCHING',
      },
    });
    bot.hex = '#32a4a8';

    const app = express();

    app.use((req, res, next) => {
      contentSecurityPolicy({
        useDefaults: true,
        directives: {
          defaultSrc: ['*'],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://www.jotform.com',
            'https://cdn.jsdelivr.net',
          ],
          objectSrc: ["'none'"],
          imgSrc: [
            "'self'",
            'https://www.jotform.com',
            'https://img.shields.io',
          ],
          upgradeInsecureRequests: [],
        },
        reportOnly: false,
      })(req, res, next);
    });

    app.use(
      cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    app.use(
      express.static(process.cwd() + '/web/public', {
        dotfiles: 'allow',
      })
    );
    app.set('views', process.cwd() + '/web/views/');
    app.set('view engine', 'ejs');
    app.set('trust proxy', 1);

    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Tracing.Integrations.Express({ app }),
          new Tracing.Integrations.Mongo({ useMongoose: true }),
        ],

        tracesSampleRate: 1.0,
      });

      console.log('🔷 Sentry initialized.');
    } catch (err) {
      throw new Error(err);
    }

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    app.use(logHander);
    //app.use(helmet());
    app.use(cookieParser());

    app.use(json());
    app.use(urlencoded({ extended: true }));

    // Endpoints should go here.
    mountRoutes(app);

    // Middlewares should go here.
    app.use(notFound);
    app.use(Sentry.Handlers.errorHandler());
    app.use(errorHandler);

    // Start web services
    const port = process.env.PORT;

    if (process.env.NODE_ENV === 'development') {
      app.listen(port || 1337, () => {
        console.log(
          `🔶 Web services are listening on http://localhost:${port} or on http://${process.env.DOMAIN}.`
        );
      });
    } else if (process.env.NODE_ENV === 'production') {
      // Capture crashes etc. Docker will restart the application on crash no worries ¯\_(ツ)_/¯.
      process.on('uncaughtException', (err) => {
        Sentry.captureException(err);
        console.log(`Uncaught Exception: ${err.message}`);
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        Sentry.captureException(reason + promise);
        console.log('Unhandled rejection at ', promise, `reason: ${reason}`);
        process.exit(1);
      });

      process.on('exit', (code) => {
        Sentry.captureEvent(`Process exited with code: ${code}`);
        console.log(`Process exited with code: ${code}`);
      });

      process.on('SIGTERM', (signal) => {
        Sentry.captureEvent(
          `Process ${process.pid} received a SIGTERM signal - ${signal}`
        );
        console.log(`Process ${process.pid} received a SIGTERM signal`);
        process.exit(0);
      });

      process.on('SIGINT', (signal) => {
        Sentry.captureEvent(
          `Process ${process.pid} has been interrupted - ${signal}`
        );
        console.log(`Process ${process.pid} has been interrupted`);
        process.exit(0);
      });

      // Use Express and native HTTP & HTTPS services with Let's Encrypt SSL.
      if (process.env.METHOD === 'express') {
        const fs = require('fs');

        const privateKey = fs.readFileSync(
          `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`,
          'utf8'
        );

        const certificate = fs.readFileSync(
          `/etc/letsencrypt/live/${process.env.DOMAIN}/cert.pem`,
          'utf8'
        );

        const ca = fs.readFileSync(
          `/etc/letsencrypt/live/${process.env.DOMAIN}/chain.pem`,
          'utf8'
        );

        const credentials = {
          key: privateKey,
          cert: certificate,
          ca: ca,
        };

        const http = require('http');
        const https = require('https');

        const httpServer = http.createServer(app);
        const httpsServer = https.createServer(credentials, app);

        httpServer.listen(80, () => {
          console.log(`🔶 HTTP Server running on http://${process.env.DOMAIN}`);
        });

        httpsServer.listen(443, () => {
          console.log(
            `🔶 HTTPS Server running on https://${process.env.DOMAIN}`
          );
        });
      } else if (process.env.METHOD === 'nginx') {
        // Use NGINX Reverse Proxy. (recommended)
        app.listen(port, () => {
          console.log(
            `🔶 Web services are listening on https://${process.env.DOMAIN}:${port}`
          );
        });
      }
    }

    // Start Redis
    const subscriber = await redis.createClient({
      url: `${process.env.REDIS_URI}`,
    });

    subscriber.on('error', (err) => {
      throw new Error(err);
    });

    subscriber.on('message', async (channel, message) => {
      if (channel === 'user-login') {
        const u = JSON.parse(message);

        const user = await userModel.findOne({
          userId: u.discordId,
        });

        if (!user) {
          await userModel.create({
            userId: u.discordId,
            name: u.name,
            apiKey: u.apiKey,
            username: u.username,
            status: u.status,
          });
          const discordUser = await bot.users.cache.get(u.discordId);
          await discordUser.send(
            Embed.success(`Success! You are logged in ${u.name}`)
          );
        }
      }

      if (channel === 'submission-hooks') {
        const s = JSON.parse(message);
        const questions = [];
        const answers = [];

        await s.pretty.split(',').map((el) => {
          el = el.split(':');
          questions.push(el[0]);
          answers.push(el[1]);
        });

        const hook = await submissionModel.findOne({
          formId: s.formID,
        });

        if (hook) {
          const hookChannel = await bot.channels.cache.get(hook.channelId);
          const createEmbed = Embed.success(
            'New submission has arrived!'
          ).setAuthor(`${s.formTitle}`);
          for (let i = 0; i < questions.length; i++) {
            createEmbed.addField(
              `${questions[i] || 'Undefined'}`,
              `${answers[i] || 'Undefined'}`
            );
          }
          await hookChannel.send(createEmbed);
        }
      }
    });
    subscriber.subscribe(['user-login', 'submission-hooks']);
    console.log('🔷 Redis subscriber is ready.');

    const redisClient = await redis.createClient({
      url: `${process.env.REDIS_URI}`,
    });

    redisClient.on('error', (err) => {
      throw new Error(err);
    });

    const commands = await bot.commands.array();

    redisClient.set('commands', JSON.stringify(commands));

    console.log('🔷 Redis client is ready.');

    module.exports = {
      bot,
      Sentry,
    };
  }
};
