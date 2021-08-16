const fetch = require('node-fetch');
const redis = require('redis');
const { Router } = require('express');

const publisher = redis.createClient({
  url: `${process.env.REDIS_URI}`,
});

publisher.on('error', (err) => {
  throw new Error(err);
});

console.log('🔷 Redis publisher is ready.');

const router = new Router();

module.exports = router;

router.get('/login', async (req, res, next) => {
  try {
    const { discordId, apiKey } = req.query;
    if (!discordId) {
      return res.redirect('/');
    }

    return res.render('../views/login', {
      nav: 'login',
      discordId: discordId,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/result', async (req, res, next) => {
  try {
    const { apiKey, discordId } = req.query;
    if (!apiKey && !discordId) {
      return res.redirect('login');
    }

    await fetch('https://api.jotform.com/user', {
      method: 'GET',
      headers: {
        APIKEY: apiKey,
      },
    })
      .then((res) => res.json())
      .then(async (json) => {
        if (json.responseCode === 200) {
          const data = {
            discordId,
            name: json.content.name,
            email: json.content.email,
            username: json.content.username,
            apiKey: apiKey,
            status: json.content.status,
          };

          publisher.publish('user-login', JSON.stringify(data));

          res.render('../views/auth-result', {
            nav: 'result',
            status: 'success',
            name: json.content.name,
            apiKey,
            discordId,
          });
        } else {
          res.redirect(`/oauth/login?discordId=${discordId}`);
        }
      });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
