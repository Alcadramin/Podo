const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const express = require('express');
const { json, urlencoded } = require('express');

const { BotEvent } = require('../../lib');
const logHander = require('../..//web/middlewares/logHandler');
const errorHandler = require('../../web/middlewares/errorHandler');
const notFound = require('../../web/middlewares/notFound');
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

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
      ],

      tracesSampleRate: 1.0,
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    app.use(logHander);
    app.use(helmet());
    app.use(cookieParser());
    app.use(
      cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
    app.use(json());
    app.use(urlencoded({ extended: true }));

    // Endpoints should go here.
    app.get('/', (req, res) => {
      res.json({
        message: '🥞',
      });
    });

    // Middlewares should go here.

    app.use(Sentry.Handlers.errorHandler());
    app.use(errorHandler);
    app.use(notFound);

    // Start web services
    const port = process.env.PORT || 1337;

    app.listen(port, () => {
      console.log(`⚡ API is listening on ${port}`);
    });

    module.exports = {
      bot,
      Sentry,
    };
  }
};
