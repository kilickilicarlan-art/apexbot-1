const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yazitura')
    .setDescription('Yazı tura atar'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Yazı' : 'Tura';
    const emoji = result === 'Yazı' ? '📄' : '🪙';

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🪙 Yazı Tura')
      .setDescription(`**${result}** ${emoji}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
