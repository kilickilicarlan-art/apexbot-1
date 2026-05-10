const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketekle')
    .setDescription('Ticket açan kullanıcıya yetkili ekler (ticket kanalında kullan)')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Ticket açan kullanıcı')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');

    if (!interaction.channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ Bu komut sadece ticket kanallarında kullanılabilir!', ephemeral: true });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setDescription(`✅ ${user} ticket kanalına eklendi!`);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Kullanıcı eklenirken bir hata oluştu!', ephemeral: true });
    }
  }
};
