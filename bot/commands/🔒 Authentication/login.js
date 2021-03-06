const { Command, Embed } = require('../../../lib');

module.exports = class Login extends Command {
  constructor() {
    super('login', {
      description: 'Login to JotForm.',
    });
  }

  async run(message, [key, ...args]) {
    const userModel = require('../../../lib/models/User');
    const { Sentry } = require('../../events/ready');
    const { JotForm } = require('../../../jotform-sdk');

    try {
      const user = await userModel.findOne({
        userId: message.author.id,
      });

      if (user) {
        return message.author.send(
          Embed.success(`You are already logged in! **${user.name}.**`)
        );
      }

      message.channel.send(
        Embed.success("I've send you a DM, let's talk in private! 🐈")
      );

      if (message.author.bot) {
        return;
      }

      const emojiList = ['\u0031\u20E3', '\u0032\u20E3'];
      const verifyEmojiList = ['\u274E', '\u2705'];

      const login = await message.author.send(
        Embed.success(
          'Hello, lets get you logged in. You can either login with your **Username/Password** or you can login with **Api Key** that you can obtain from your account settings. Please react in 5 minutes.'
        )
          .addFields(
            {
              name: 'Username/Password',
              value: 'React to 1️⃣ emoji',
              inline: true,
            },
            {
              name: 'Api Key',
              value: 'React to 2️⃣ emoji',
              inline: true,
            }
          )
          .setAuthor('Login')
      );

      // Delete DM Messages use it when developing.
      // return login.channel.messages
      //   .fetch({
      //     limit: 100,
      //   })
      //   .then((msg) => {
      //     msg.forEach((element) => {
      //       console.log(element);
      //       element.delete();
      //     });
      //   });

      for (const emoji of emojiList) {
        login.react(emoji);
      }

      const filter = (reaction, user) => {
        return (
          emojiList.includes(reaction.emoji.name) &&
          user.id === message.author.id
        );
      };

      const verifyFilter = (reaction, user) => {
        return (
          verifyEmojiList.includes(reaction.emoji.name) &&
          user.id === message.author.id
        );
      };

      const credentials = [];

      const messageFilter = (user) => user.author.id === message.author.id;

      const loginApiKeyMethod = async () => {
        login.reply('Please give me your **API Key**.');
        await login.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then((reply) => {
            credentials.push(reply.first().content);
          })
          .catch((err) => {
            console.error(err);
            Sentry.captureException(err);
            login.reply("You didn't answered in time, please start again.");
          });

        login.reply(
          `You have entered your **API Key** as \`${credentials[0]}\``
        );
      };

      const verifyApiLogin = async () => {
        const verifyApi = await message.author.send(
          Embed.success('Here is your info, is this correct?')
            .setAuthor('Verify Login Information')
            .addFields({
              name: 'Api Key',
              value: credentials[0],
              inline: false,
            })
        );

        for (const emoji of verifyEmojiList) {
          verifyApi.react(emoji);
        }

        verifyApi
          .awaitReactions(verifyFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (collected) => {
            if (collected.first().emoji.name !== '\u2705') {
              await loginApiKeyMethod();
              verifyApiLogin();
            } else {
              const JF = new JotForm();
              JF.setApiKey(credentials[0]);

              JF.user
                .getUser()
                .then(async (response) => {
                  await userModel
                    .create({
                      userId: message.author.id,
                      name: response.content.name,
                      username: response.content.username,
                      email: response.content.email,
                      status: response.content.status,
                      apiKey: credentials[0],
                    })
                    .then((data) => {
                      return verifyApi.reply(
                        Embed.success(`Hello **${data.name}**!`)
                          .setAuthor('Success')
                          .addFields(
                            {
                              name: 'Email',
                              value: data.email,
                              inline: true,
                            },
                            {
                              name: 'Username',
                              value: data.username,
                              inline: true,
                            },
                            {
                              name: 'Information',
                              value:
                                'You are successfully logged in. Your account is bind to your Discord ID, you do not have to login again! 😸',
                              inline: false,
                            }
                          )
                      );
                    });
                })
                .catch(async (err) => {
                  Sentry.captureException(err);
                  verifyApi.reply(
                    Embed.error(`${json.message}`)
                      .setAuthor('Error')
                      .addFields({
                        name: 'Error',
                        value: '\u274E Something went wrong, lets try again.',
                        inline: false,
                      })
                  );
                  await loginApiKeyMethod();
                  verifyApiKey();
                });
            }
          });
      };

      const loginNormalMethod = () => {
        return login.reply(
          Embed.success(
            'Click the link below to login. You will get a DM when you are authorized.'
          )
            .setAuthor('Login to JotForm')
            .addField(
              'Login:',
              `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${
                process.env.DOMAIN
              }/oauth/login?discordId=${message.author.id}`
            )
        );
      };

      login
        .awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(async (collected) => {
          const reaction = collected.first();

          if (reaction.emoji.name === '\u0031\u20E3') {
            login.reply("You've selected **Username/Password** login method.");
            await loginNormalMethod();
          } else {
            login.reply("You've selected **API** login method.");
            await loginApiKeyMethod();
            await verifyApiLogin();
          }
        })
        .catch((err) => {
          console.error(err);
          login.reply("You didn't reacted, please start again.");
        });
    } catch (err) {
      console.error(err);
      const errorId = Sentry.captureException(err);

      return message.channel.send(
        Embed.error(
          `🐞 Something went wrong, please tell the support server the error ID: \`${errorId}\``
        )
      );
    }
  }
};
