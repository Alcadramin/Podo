const oauth = require('./oauth');
const hooks = require('./hooks');
const commands = require('./commands');

module.exports = (app) => {
  app.get('/', (req, res, next) => {
    try {
      res.render('../views/index', {
        nav: 'home',
      });
    } catch (error) {
      next(error);
    }
  });

  app.use('/commands', commands);
  app.use('/oauth', oauth);
  app.use('/hooks', hooks);
};
