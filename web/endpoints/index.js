const oauth = require('./oauth');

module.exports = (app) => {
  app.get('/', (req, res, next) => {
    res.render('../views/index', {
      nav: 'home',
    });
  });
  app.get('/about', (req, res, next) => {
    res.render('../views/about', {
      nav: 'about',
    });
  });

  app.use('/oauth', oauth);
};
