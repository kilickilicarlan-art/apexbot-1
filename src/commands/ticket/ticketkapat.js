const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketkapat')
    .setDescription('Açık ticketı kapatır (ticket kanalında kullan)')
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Kapatma sebebi')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const reason = interaction.options.getString('sebep') || 'Belirtilmedi';

    // Ticket kanalı kontrolü
    if (!interaction.channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ Bu komut sadece ticket kanallarında kullanılabilir!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🔒 Ticket Kapatılıyor')
      .setDescription(`Bu ticket **${interaction.user.tag}** tarafından kapatılıyor.\nSebep: ${reason}`)
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_close_ticket')
          .setLabel('✅ Onayla')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('cancel_close_ticket')
          .setLabel('❌ İptal')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
