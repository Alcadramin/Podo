const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production-nginx' ? '🥞' : error.stack,
  });

  if (process.env.NODE_ENV === 'production-nginx') {
    res.end(`${res.sentry} \n`);
  }
};

module.exports = errorHandler;
