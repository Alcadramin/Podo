const { Router } = require('express');
const multer = require('multer');
const redis = require('redis');

const publisher = redis.createClient({
  url: `${process.env.REDIS_URI}`,
});

publisher.on('error', (err) => {
  throw new Error(err);
});

const router = new Router();
const upload = multer();

module.exports = router;

router.post('/', upload.none(), (req, res, next) => {
  try {
    const obj = Object.assign({}, req.body);
    publisher.publish('submission-hooks', JSON.stringify(obj));

    return res.status(200).send('Ok');
  } catch (error) {
    next(error);
  }
});
