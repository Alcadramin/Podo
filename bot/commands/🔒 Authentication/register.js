const { Command, Embed } = require('../../../lib');

module.exports = class Register extends Command {
  constructor() {
    super('register', {
      description: 'Register to JotForm.',
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
          Embed.success(
            `You are already logged in! **${user.name}.** You don't need to register again. 😹`
          )
        );
      }

      message.channel.send(
        Embed.success("I've send you a DM, let's talk in private! 🐈")
      );

      if (message.author.bot) {
        return;
      }

      const emojiList = ['\u274E', '\u2705'];

      const register = await message.author.send(
        Embed.success(
          'Hello, lets get you registered to JotForm. React when you are ready!'
        ).setAuthor('Register')
      );

      const messageFilter = (user) => user.author.id === message.author.id;
      const verifyFilter = (reaction, user) => {
        return (
          emojiList.includes(reaction.emoji.name) &&
          user.id === message.author.id
        );
      };

      const getUsername = async () => {
        await register.reply(
          Embed.success('Please give me your username.').setAuthor('Username')
        );

        let value = '';

        await register.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            value = await reply.first().content;
          })
          .catch(async (err) => {
            await message.author.send(
              Embed.error('\u2705 Something went wrong, lets try again.')
            );
            console.log(err);
            await getUsername();
          });

        return value;
      };

      const getEmail = async () => {
        await register.reply(
          Embed.success('Please give me your email.').setAuthor('Email')
        );

        let value = '';

        await register.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            value = await reply.first().content;
          })
          .catch(async (err) => {
            await message.author.send(
              Embed.error('\u2705 Something went wrong, lets try again.')
            );
            console.log(err);
            await getEmail();
          });

        return value;
      };

      const getPassword = async () => {
        await register.reply(
          Embed.success('Please give me your password.').setAuthor('Password')
        );

        let value = '';

        await register.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            value = await reply.first().content;
          })
          .catch(async (err) => {
            await message.author.send(
              Embed.error('\u2705 Something went wrong, lets try again.')
            );
            console.log(err);
            await getPassword();
          });

        return value;
      };

      const startRegistration = async () => {
        const username = await getUsername();
        const email = await getEmail();
        const password = await getPassword();

        const registerDetails = await message.author.send(
          Embed.success('Here is your info, is this correct?')
            .setAuthor('Details')
            .addFields(
              {
                name: 'Username',
                value: username,
              },
              {
                name: 'Email',
                value: email,
              },
              {
                name: 'Password',
                value: `••••••${password.slice(1)}`,
              }
            )
        );

        for (const emoji of emojiList) {
          registerDetails.react(emoji);
        }

        await registerDetails
          .awaitReactions(verifyFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (collected) => {
            if (collected.first().emoji.name !== '\u274E') {
              const JF = new JotForm();
              JF.user
                .registerUser(username, password, email)
                .then(async () => {
                  await registerDetails.reply(
                    Embed.success('You are successfully registered!').addFields(
                      {
                        name: 'Tips',
                        value:
                          'Please go to your inbox, verify your email, after that login with `!login` command.',
                      },
                      {
                        name: 'Email',
                        value: email,
                      }
                    )
                  );
                })
                .catch((err) => {
                  console.log(err);
                  return registerDetails.reply(
                    Embed.error(`${err.message}`).setAuthor('Error')
                  );
                });
            } else {
              const tryAgain = await message.author.send(
                Embed.success('Would you like to start again?')
              );

              for (const emoji of emojiList) {
                tryAgain.react(emoji);
              }

              tryAgain
                .awaitReactions(verifyFilter, {
                  max: 1,
                  time: 60000,
                  errors: ['time'],
                })
                .then((collected) => {
                  if (collected.first().emoji.name !== '\u274E') {
                    startRegistration();
                  } else {
                    return tryAgain.reply(
                      Embed.success(
                        'Mhmm, okay you can use the `!register` command when you are ready.'
                      )
                    );
                  }
                });
            }
          });
      };

      for (const emoji of emojiList) {
        register.react(emoji);
      }

      register
        .awaitReactions(verifyFilter, {
          max: 1,
          time: 60000,
          errors: ['time'],
        })
        .then((collected) => {
          if (collected.first().emoji.name !== '\u2705') {
            return form.reply(
              'Mhmm, okay you can use the `!register` command when you are ready.'
            );
          } else {
            startRegistration();
          }
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
