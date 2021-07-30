const { BotEvent } = require('../../lib');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
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

    // Error handling
    Sentry.init({
      dsn: process.env.SENTRY_DSN || '',
      tracesSampleRate: 1.0,
    });

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
      Sentry.captureEvent(`Process ${process.pid} received a SIGTERM signal`);
      console.log(`Process ${process.pid} received a SIGTERM signal`);
      process.exit(0);
    });

    process.on('SIGINT', (signal) => {
      Sentry.captureEvent(`Process ${process.pid} has been interrupted`);
      console.log(`Process ${process.pid} has been interrupted`);
      process.exit(0);
    });

    module.exports = {
      bot,
    };
  }
};
