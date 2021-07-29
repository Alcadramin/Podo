const { MessageEmbed } = require('discord.js');

module.exports = {
  error(content) {
    return new MessageEmbed()
      .setDescription(content)
      .setColor('#f44336')
      .setFooter(
        'Oopsie whoopsie you made a podo wucky',
        'https://www.jotform.com/resources/assets/logo/jotform-icon-transparent-560x560.png'
      )
      .setTimestamp(new Date());
  },
  success(content) {
    return new MessageEmbed()
      .setDescription(content)
      .setColor('#328da8')
      .setFooter(
        'JotForm',
        'https://www.jotform.com/resources/assets/logo/jotform-icon-transparent-560x560.png'
      )
      .setTimestamp(new Date());
  },
  eval(content) {
    return new MessageEmbed().setDescription(content).setColor('#fee227');
  },
};
