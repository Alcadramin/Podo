const { Command, Embed } = require('../../../lib');

module.exports = class CreateForm extends Command {
  constructor() {
    super('createForm', {
      description: 'Create a form!',
    });
  }

  async run(message, [key, ...args]) {
    const userModel = require('../../../lib/models/User');
    const { Sentry } = require('../../events/ready');
    const { JotForm } = require('../../../jotform-sdk');

    try {
      const user = await userModel.findOne({ userId: message.author.id });

      if (!user) {
        return message.channel.send(
          Embed.error(
            'You should login first! You can login with `login` command!'
          ).setAuthor('Error')
        );
      }

      const apiKey = await user.decryptKey(user.apiKey);

      const JF = new JotForm();
      JF.setApiKey(apiKey);

      message.channel.send(
        Embed.success("I've send you a DM, let's talk in private! 🐈")
      );

      const form = await message.author.send(
        Embed.success(
          "Let's create your form! Would you like to start?"
        ).setAuthor('Create Form')
      );

      const questions = [];
      const emojiList = ['\u274E', '\u2705'];
      const qTypes = [
        'textbox',
        'textarea',
        'dropdown',
        'radio',
        'checkbox',
        'fileupload',
        'fullname',
        'email',
        'datetime',
      ];

      const messageFilter = (user) => user.author.id === message.author.id;
      const verifyFilter = (reaction, user) => {
        return (
          emojiList.includes(reaction.emoji.name) &&
          user.id === message.author.id
        );
      };

      const getOptions = async () => {
        await form.reply(
          Embed.success(
            'Please give me your questions options in this format: `Option 1 | Option 2 | Option 3`'
          ).addFields(
            {
              name: 'Generic',
              value: 'Option 1 | Option 2 | Option 3',
            },
            {
              name: '**Example**: What is your favorite color?',
              value: 'Red | Blue | Green | Yellow',
            }
          )
        );

        let value = '';

        await form.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            value = await reply.first().content;
          })
          .catch(async (err) => {
            Sentry.captureException(err);
            await message.author.send(
              Embed.error('\u274E Something went wrong, lets try again.')
            );
            console.log(err);
            await getOptions();
          });

        return value;
      };

      const getQuestionType = async () => {
        await form.reply(
          Embed.success(
            'What is the type of question? Reply to me with one of the types. **Example:** `Textbox`. You can see all of the types below.'
          )
            .setAuthor('Create Form')
            .addFields({
              name: 'Question Types',
              value:
                'Textbox, Textarea, Dropdown, Radio, Checkbox, Fileupload, Fullname, Email, Datetime',
            })
        );

        let value = '';

        await form.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            const answer = reply.first().content.toLowerCase();

            if (!qTypes.includes(answer)) {
              message.author.send(
                Embed.error('Hmm seems you gave me wrong type lets try again.')
              );
              await getQuestionType();
            }

            switch (answer) {
              case 'textbox':
                value = 'control_textbox';
                break;
              case 'textarea':
                value = 'control_textarea';
                break;
              case 'dropdown':
                value = 'control_dropdown';
                break;
              case 'radio':
                value = 'control_radio';
                break;
              case 'checkbox':
                value = 'control_checkbox';
                break;
              case 'fileupload':
                value = 'control_fileupload';
                break;
              case 'fullname':
                value = 'control_fullname';
                break;
              case 'email':
                value = 'control_email';
                break;
              case 'datetime':
                value = 'control_datetime';
                break;
            }
          })
          .catch(async (err) => {
            Sentry.captureException(err);
            await message.author.send(
              Embed.error('\u274E Something went wrong, lets try again.')
            );
            console.log(err);
            await getQuestionType();
          });

        return value;
      };

      const isRequired = async () => {
        await form.reply(
          Embed.success('Is your question **required**?').addFields({
            name: 'Reply to me with one of these:',
            value: '**Yes** or **No**',
          })
        );

        let value = '';

        await form.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            const isrequired = reply.first().content.toLowerCase();

            if (isrequired === 'yes' || isrequired === 'no') {
              switch (isrequired) {
                case 'yes':
                  value = 'Yes';
                  break;
                case 'no':
                  value = 'No';
                  break;
              }
            } else {
              message.author.send(
                Embed.error('Hmm seems you gave me wrong type lets try again.')
              );
              await isRequired();
            }
          })
          .catch(async (err) => {
            Sentry.captureException(err);
            await message.author.send(
              Embed.error('\u274E Something went wrong, lets try again.')
            );
            console.log(err);
            await getQuestionType();
          });

        return value;
      };

      const isReadOnly = async () => {
        await form.reply(
          Embed.success('Is your question **read only**?').addFields({
            name: 'Reply to me with one of these:',
            value: '**Yes** or **No**',
          })
        );

        let value = '';

        await form.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            const isreadonly = reply.first().content.toLowerCase();

            if (isreadonly === 'yes' || isreadonly === 'no') {
              switch (isreadonly) {
                case 'yes':
                  value = 'Yes';
                  break;
                case 'no':
                  value = 'No';
                  break;
              }
            } else {
              message.author.send(
                Embed.error('Hmm seems you gave me wrong type lets try again.')
              );
              await isReadOnly();
            }
          })
          .catch(async (err) => {
            Sentry.captureException(err);
            await message.author.send(
              Embed.error('\u274E Something went wrong, lets try again.')
            );
            console.log(err);
            await isReadOnly();
          });

        return value;
      };

      const getQuestionName = async () => {
        await form.reply(Embed.success('What is the name of your question?'));

        let value = '';

        await form.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            value = await reply.first().content;
          })
          .catch(async (err) => {
            Sentry.captureException(err);
            await message.author.send(
              Embed.error('\u274E Something went wrong, lets try again.')
            );
            console.log(err);
            await getQuestionName();
          });

        return value;
      };

      const getFormTitle = async () => {
        await form.reply(
          Embed.success('What is the title of your form?').setColor('#f59542')
        );

        let value = '';

        await form.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            value = await reply.first().content;
          })
          .catch(async (err) => {
            Sentry.captureException(err);
            await message.author.send(
              Embed.error('\u274E Something went wrong, lets try again.')
            );
            console.log(err);
            await getFormTitle();
          });

        return value;
      };

      const getFormSubtitle = async () => {
        await form.reply(
          Embed.success(
            'What is the subtitle of your form? If you dont want one you can reply with: `None`'
          ).setColor('#f59542')
        );

        let value = '';

        await form.channel
          .awaitMessages(messageFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (reply) => {
            if (reply.first().content.toLowerCase() !== 'none') {
              value = await reply.first().content;
            }
          })
          .catch(async (err) => {
            Sentry.captureException(err);
            await message.author.send(
              Embed.error('\u274E Something went wrong, lets try again.')
            );
            console.log(err);
            await getFormSubtitle();
          });

        return value;
      };

      let isTitlePushed = false;
      let order = 0;

      const createQuestion = async () => {
        let formTitle = '';
        let formSubtitle = '';

        if (!isTitlePushed) {
          formTitle = await getFormTitle();
          formSubtitle = await getFormSubtitle();
        }

        const questionType = await getQuestionType();
        let options = '';

        if (
          questionType === 'control_dropdown' ||
          questionType === 'control_radio'
        ) {
          options = await getOptions();
        }

        const questionName = await getQuestionName();
        const required = await isRequired();
        const readOnly = await isReadOnly();

        const questionMsg = await message.author.send(
          Embed.success(
            'Here is a brief question details, would you like to add an another question?'
          ).addFields(
            {
              name: 'Question Name',
              value: questionName || 'No Name',
            },
            {
              name: 'Question Type',
              value: questionType || 'No Type',
            },
            {
              name: 'Question Options',
              value: options ? options : 'None',
            },
            {
              name: 'Required?',
              value: required || 'Undefined',
            },
            {
              name: 'Read only?',
              value: readOnly || 'Undefined',
            }
          )
        );

        if (!isTitlePushed) {
          questions.push({
            type: 'control_head',
            text: formTitle || '',
            order: order++,
            name: 'Header',
            subHeader: formSubtitle || '',
          });

          isTitlePushed = true;
        }

        if (options) {
          questions.push({
            type: questionType,
            text: questionName,
            order: order++,
            name: questionName,
            valudation: 'None',
            required: required,
            readonly: readOnly,
            options: options,
          });
        } else {
          questions.push({
            type: questionType,
            text: questionName,
            order: order++,
            name: questionName,
            valudation: 'None',
            required: required,
            readonly: readOnly,
          });
        }

        for (const emoji of emojiList) {
          questionMsg.react(emoji);
        }

        await questionMsg
          .awaitReactions(verifyFilter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async (collected) => {
            if (collected.first().emoji.name !== '\u2705') {
              await questions.push({
                type: 'control_button',
                text: 'Submit',
                order: order++,
              });

              await JF.form
                .createForms({
                  questions: questions,
                  properties: {
                    title: formTitle || 'No Title',
                    height: '600',
                    thanktext:
                      'Thank you, your submission has been received! ✅',
                    activeRedirect: 'thanktext',
                    styles: 'nova',
                    themeID: '5e6b428acc8c4e222d1beb91',
                    defaultTheme: 'v2',
                  },
                })
                .then((response) => {
                  return questionMsg.reply(
                    Embed.success(
                      '\u2705 Your form is successfully created! Here is the links to your form.'
                    )
                      .addFields(
                        {
                          name: 'Form URL (Submit answers from here.)',
                          value: response.content.url,
                        },
                        {
                          name: 'Editor URL (You can edit your form from here.)',
                          value: `https://www.jotform.com/build/${response.content.id}`,
                        },
                        {
                          name: 'Submissions URL (You can check submissions from here.)',
                          value: `https://www.jotform.com/tables/${response.content.id}`,
                        }
                      )
                      .setColor('#44c902')
                  );
                })
                .catch((err) => {
                  console.log(err);
                  Sentry.captureException(err);
                  return questionMsg.reply(
                    Embed.error(
                      '\u274E Something went wrong, try again later. Probably JotForm is super busy, it should recover as soon as possible.'
                    )
                  );
                });
            } else {
              createQuestion();
            }
          });
      };

      for (const emoji of emojiList) {
        form.react(emoji);
      }

      form
        .awaitReactions(verifyFilter, {
          max: 1,
          time: 60000,
          errors: ['time'],
        })
        .then((collected) => {
          if (collected.first().emoji.name !== '\u2705') {
            return form.reply(
              'Mhmm, okay you can use the `!createform` command when you are ready.'
            );
          } else {
            createQuestion();
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
