const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sil')
    .setDescription('Mesajları siler')
    .addIntegerOption(option =>
      option.setName('miktar')
        .setDescription('Silinecek mesaj sayısı (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Belirli bir kullanıcının mesajlarını sil')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('miktar');
    const user = interaction.options.getUser('kullanici');

    if (interaction.channel.type === ChannelType.DM) {
      return interaction.reply({ content: '❌ Bu komut DM de kullanılamaz!', ephemeral: true });
    }

    try {
      let deletedMessages;
      
      if (user) {
        const messages = await interaction.channel.messages.fetch({ limit: amount });
        const userMessages = messages.filter(m => m.author.id === user.id);
        deletedMessages = await interaction.channel.bulkDelete(userMessages, true);
      } else {
        deletedMessages = await interaction.channel.bulkDelete(amount, true);
      }

      const embed = new EmbedBuilder()
        .setColor('#00FFFF')
        .setDescription(`🗑️ **${deletedMessages.size}** mesaj silindi!`)
        .setTimestamp();

      const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
      
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Mesajlar silinirken bir hata oluştu! (14 günden eski mesajlar silinemez)', ephemeral: true });
    }
  }
};
