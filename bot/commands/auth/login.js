const { Command, Embed } = require('../../../lib');
module.exports = class Login extends Command {
  constructor() {
    super('login', {
      description: 'Login to JotForm',
    });
  }

  async run(message, [key, ...args]) {
    const userModel = require('../../../lib/models/User');
    const { Sentry } = require('../../events/ready');
    const fetch = require('node-fetch');

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
              name: 'Api Key (recommended)',
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

      const messageFilter = (user) => user.author.id === message.author.id;

      const credentials = [];

      const loginNormalMethod = async () => {
        login.reply('Please give me your **Username**.');
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
            login.reply("You didn't answered in time, please start again.");
          });

        login.reply(
          `You've entered your **Username** as \`${credentials[0]}\`.`
        );
        login.reply('Please give me your **Password**.');

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
            login.reply("You didn't answered in time, please start again.");
          });

        login.reply(
          `You've entered your **Password** as \`*****${credentials[1].slice(
            -2
          )}\``
        );
      };

      const verifyLogin = async () => {
        const verify = await message.author.send(
          Embed.success('Here is your info, is this correct?')
            .setAuthor('Verify Login Information')
            .addFields(
              {
                name: 'Username',
                value: credentials[0],
                inline: true,
              },
              {
                name: 'Password',
                value: `*****${credentials[1].slice(-2)}`,
                inline: true,
              }
            )
        );

        for (const emoji of verifyEmojiList) {
          verify.react(emoji);
        }

        verify
          .awaitReactions(verifyFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (collected) => {
            if (collected.first().emoji.name !== '\u2705') {
              await loginNormalMethod();
              verifyLogin();
            } else {
              await fetch('https://api.jotform.com/user/login', {
                method: 'POST',
                body: `username=${credentials[0]}&password=${credentials[1]}&access=Full&appName=Podo`,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              })
                .then((res) => res.json())
                .then(async (json) => {
                  if (json.responseCode === 401) {
                    verify.reply(
                      Embed.error(`${json.message}`)
                        .setAuthor('Error')
                        .addFields({
                          name: 'Error',
                          value: 'Something went wrong. Please try again.',
                          inline: false,
                        })
                    );
                    await loginNormalMethod();
                    verifyLogin();
                  } else {
                    // TODO: Get and save user API Key to DB. Can't obtain it right now.
                    return verify.reply(
                      Embed.success(`Hello **${json.content.name}**!`)
                        .setAuthor('Success')
                        .addFields(
                          {
                            name: 'Email',
                            value: json.content.email,
                            inline: true,
                          },
                          {
                            name: 'Username',
                            value: json.content.username,
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
                  }
                });
            }
          });
      };

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
              await fetch(`https://api.jotform.com/user`, {
                method: 'GET',
                headers: {
                  APIKEY: credentials[0],
                },
              })
                .then((res) => res.json())
                .then(async (json) => {
                  if (json.responseCode === 401) {
                    verifyApi.reply(
                      Embed.error(`${json.message}`)
                        .setAuthor('Error')
                        .addFields({
                          name: 'Error',
                          value: 'Something went wrong. Please try again.',
                          inline: false,
                        })
                    );
                    await loginApiKeyMethod();
                    verifyApiKey();
                  } else {
                    await userModel
                      .create({
                        userId: message.author.id,
                        name: json.content.name,
                        username: json.content.username,
                        email: json.content.email,
                        status: json.content.status,
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
                  }
                });
            }
          });
      };

      login
        .awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(async (collected) => {
          const reaction = collected.first();

          if (reaction.emoji.name === '\u0031\u20E3') {
            login.reply("You've selected **Username/Password** login method.");
            await loginNormalMethod();
            await verifyLogin();
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
