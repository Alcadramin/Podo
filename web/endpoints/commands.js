const { Router } = require('express');
const redis = require('redis');
const { promisify } = require('util');

redisClient = redis.createClient({
  url: `${process.env.REDIS_URI}`,
});

const router = new Router();
module.exports = router;

router.get('/', async (req, res, next) => {
  try {
    const getAsync = promisify(redisClient.get).bind(redisClient);
    const commands = await getAsync('commands');
    const commandArr = JSON.parse(commands);

    return res.render('../views/commands.ejs', {
      nav: 'commands',
      commands: commandArr
        .sort((a, b) =>
          a.category > b.category ? 1 : b.category > a.category ? -1 : 0
        )
        .map((c) => {
          return {
            name: c.name[0].toUpperCase() + c.name.slice(1),
            category: c.category,
            description: c.description,
            usage: `!${c.name} ${c.usage}`,
          };
        }),
    });
  } catch (error) {
    next(error);
  }
});
