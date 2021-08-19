const oauth = require('./oauth');
const hooks = require('./hooks');
const commands = require('./commands');

module.exports = (app) => {
  app.get('/', (req, res, next) => {
    try {
      const { status } = req.query;

      res.render('../views/index', {
        nav: 'home',
        status,
      });
    } catch (error) {
      next(error);
    }
  });

  app.use('/commands', commands);
  app.use('/oauth', oauth);
  app.use('/hooks', hooks);
};
