const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketcikar')
    .setDescription('Kullanıcıyı ticket kanalından çıkarır (ticket kanalında kullan)')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Çıkarılacak kullanıcı')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');

    if (!interaction.channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ Bu komut sadece ticket kanallarında kullanılabilir!', ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Kendini çıkaramazsın!', ephemeral: true });
    }

    try {
      await interaction.channel.permissionOverwrites.delete(user);

      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setDescription(`✅ ${user} ticket kanalından çıkarıldı!`);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Kullanıcı çıkarılırken bir hata oluştu!', ephemeral: true });
    }
  }
};
