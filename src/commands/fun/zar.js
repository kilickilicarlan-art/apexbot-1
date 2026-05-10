const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zar')
    .setDescription('Zar atar')
    .addIntegerOption(option =>
      option.setName('yuz')
        .setDescription('Kaç yüzlü zar? (varsayılan: 6)')
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('adet')
        .setDescription('Kaç zar atılacak? (varsayılan: 1)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)),

  async execute(interaction) {
    const sides = interaction.options.getInteger('yuz') || 6;
    const count = interaction.options.getInteger('adet') || 1;

    const results = [];
    let total = 0;

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      results.push(roll);
      total += roll;
    }

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('🎲 Zar Sonucu')
      .addFields(
        { name: 'Zar Yüzü', value: `${sides}`, inline: true },
        { name: 'Atış Sayısı', value: `${count}`, inline: true },
        { name: 'Sonuçlar', value: results.join(', '), inline: false },
        { name: 'Toplam', value: `${total}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
