const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cekilissil')
    .setDescription('Çekilişi tamamen siler')
    .addStringOption(option =>
      option.setName('mesaj_id')
        .setDescription('Çekiliş mesajının ID si')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const messageId = interaction.options.getString('mesaj_id');

    const giveaway = interaction.client.giveaways.get(messageId);

    if (!giveaway || giveaway.guildId !== interaction.guild.id) {
      return interaction.reply({ 
        content: '❌ Bu ID ile bir çekiliş bulunamadı veya bu sunucuda değil!', 
        ephemeral: true 
      });
    }

    try {
      // Mesajı sil
      try {
        const channel = await interaction.client.channels.fetch(giveaway.channelId);
        const message = await channel.messages.fetch(messageId);
        await message.delete();
      } catch {}

      // Veriyi sil
      interaction.client.giveaways.delete(messageId);

      await interaction.reply({ 
        content: '✅ Çekiliş tamamen silindi!',
        ephemeral: true 
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: '❌ Çekiliş silinirken bir hata oluştu!', 
        ephemeral: true 
      });
    }
  }
};
