const redis = require('redis');
const { JotForm } = require('../../jotform-sdk');
const { Router } = require('express');
const { isEmpty } = require('lodash');
const userModel = require('../../lib/models/User');

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
    const { discordId, status } = req.query;
    const user = await userModel.find({ userId: discordId });
    if (!isEmpty(user)) {
      return res.redirect('/?status=loggedIn');
    }

    if (!discordId) {
      return res.redirect('/?status=missingId');
    }

    return res.render('../views/login', {
      nav: 'login',
      discordId: discordId,
      status,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/result', async (req, res, next) => {
  try {
    const { apiKey, discordId } = req.query;

    const user = await userModel.find({ userId: discordId });
    if (!isEmpty(user)) {
      return res.redirect('/?status=loggedIn');
    }

    if (!discordId) {
      return res.redirect('/?status=missingId');
    }

    if (!apiKey) {
      return res.redirect(`login?discordId=${discordId}&status=missingKey`);
    }

    const JF = new JotForm();
    JF.setApiKey(apiKey);

    await JF.user
      .getUser()
      .then((result) => {
        const data = {
          discordId,
          name: result.content.name,
          email: result.content.email,
          username: result.content.username,
          status: result.content.status,
          apiKey: apiKey,
        };

        publisher.publish('user-login', JSON.stringify(data));

        res.render('../views/auth-result', {
          nav: 'result',
          status: 'success',
          name: result.content.name,
          apiKey,
          discordId,
        });
      })
      .catch(() => {
        res.redirect(`/oauth/login?discordId=${discordId}&status=unauthorized`);
      });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
