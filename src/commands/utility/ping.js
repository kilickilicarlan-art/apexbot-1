const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botun gecikme süresini gösterir'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Ping ölçülüyor...', fetchReply: true });
    
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    let status = '🟢';
    if (latency > 200) status = '🟡';
    if (latency > 500) status = '🔴';

    const embed = new EmbedBuilder()
      .setColor(latency < 200 ? '#57F287' : latency < 500 ? '#FEE75C' : '#ED4245')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Gecikmesi', value: `${status} ${latency}ms`, inline: true },
        { name: 'API Gecikmesi', value: `${apiLatency}ms`, inline: true },
        { name: 'Durum', value: latency < 200 ? 'Mükemmel!' : latency < 500 ? 'Normal' : 'Yavaş', inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ content: '', embeds: [embed] });
  }
};
