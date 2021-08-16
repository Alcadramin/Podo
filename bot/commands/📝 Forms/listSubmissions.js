const { Command, Embed } = require('../../../lib');

module.exports = class listSubmissions extends Command {
  constructor() {
    super('listSubmissions', {
      description: 'List the posts you have added to the realtime collection.',
      usage: '',
    });
  }

  async run(message, [...args]) {
    const submissionModel = require('../../../lib/models/SubmissionHooks');
    const { Sentry } = require('../../events/ready');
    const { isEmpty } = require('lodash');
    require('dotenv').config();

    try {
      const submissions = await submissionModel.find({
        userId: message.author.id,
      });

      if (isEmpty(submissions)) {
        return message.channel.send(
          Embed.error(
            'There is no form submissions to listen right now, you can add with: `!startsubmissions` command!'
          ).setAuthor('Not Found.')
        );
      }

      const createEmbed = await Embed.success(
        'I am currently listening these forms.'
      ).setAuthor('List');

      for (let i = 0; i < submissions.length; i++) {
        createEmbed.addField(
          submissions[i].formName || 'No Title',
          `https://form.jotform.com/${submissions[i].formId} - **Form ID:** ${submissions[i].formId}`
        );
      }

      return message.channel.send(createEmbed);
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
