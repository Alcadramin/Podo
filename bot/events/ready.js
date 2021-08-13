const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const contentSecurityPolicy = require('helmet-csp');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const express = require('express');
const { json, urlencoded } = require('express');
const redis = require('redis');
const crypto = require('crypto');

const { BotEvent, Embed } = require('../../lib');
const userModel = require('../../lib/models/User');
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
      res.locals.nonce = crypto.randomBytes(16).toString('hex');
      next();
    });

    app.use((req, res, next) => {
      contentSecurityPolicy({
        useDefaults: true,
        directives: {
          defaultSrc: [
            "'self'",
            `'nonce-${res.locals.nonce}'`,
            'https://js.jotform.com/JotForm.js',
            'https://www.jotform.com',
            'https://cdn.jsdelivr.net',
          ],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://www.jotform.com',
            'https://cdn.jsdelivr.net',
          ],
          objectSrc: ["'none'"],
          imgSrc: ["'self'", 'https://www.jotform.com'],
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

    app.use(express.static(process.cwd() + '/web/public'));
    app.set('views', process.cwd() + '/web/views/');
    app.set('view engine', 'ejs');

    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Tracing.Integrations.Express({ app }),
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
    const port = process.env.PORT || 1337;

    app.listen(port, () => {
      console.log(`🔶 Web services are listening on http://localhost:${port}.`);
    });

    const subscriber = redis.createClient();

    subscriber.on('error', (err) => {
      throw new Error(err);
    });

    console.log('🔷 Redis subscriber is ready.');

    subscriber.on('message', (channel, message) => {
      json = JSON.parse(message);
      userModel.create({
        userId: json.discordId,
        name: json.name,
        apiKey: json.apiKey,
        username: json.username,
        status: json.status,
      });

      const user = bot.users.cache.get(json.discordId);
      user.send(Embed.success(`Success! You are logged in ${json.name}`));
    });

    subscriber.subscribe('user-login');

    module.exports = {
      bot,
      Sentry,
      subscriber,
    };
  }
};
