const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cekilisreroll')
    .setDescription('Bitmiş çekilişte yeni kazanan(lar) belirler')
    .addStringOption(option =>
      option.setName('mesaj_id')
        .setDescription('Çekiliş mesajının ID si')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('kazanan_sayisi')
        .setDescription('Yeni kazanan sayısı (belirtilmezse orijinal sayı)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const messageId = interaction.options.getString('mesaj_id');
    const winnerCount = interaction.options.getInteger('kazanan_sayisi') || 1;

    const giveaway = interaction.client.giveaways.get(messageId);

    if (!giveaway || giveaway.guildId !== interaction.guild.id) {
      return interaction.reply({ 
        content: '❌ Bu ID ile bir çekiliş bulunamadı veya bu sunucuda değil!', 
        ephemeral: true 
      });
    }

    if (!giveaway.ended) {
      return interaction.reply({ 
        content: '❌ Bu çekiliş henüz bitmemiş! Önce bitirmen gerek.', 
        ephemeral: true 
      });
    }

    if (giveaway.participants.length === 0) {
      return interaction.reply({ 
        content: '❌ Bu çekilişte katılımcı yok, reroll yapılamaz!', 
        ephemeral: true 
      });
    }

    try {
      // Yeni kazananları belirle
      const shuffled = [...giveaway.participants].sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, winnerCount);

      const channel = await interaction.client.channels.fetch(giveaway.channelId);

      // Yeni kazananları duyur
      await channel.send({
        content: `🔄 **REROLL** - Yeni Kazanan(lar): ${winners.map(id => `<@${id}>`).join(', ')}! **${giveaway.prize}** kazandınız!`
      });

      await interaction.reply({ 
        content: `✅ Yeni kazanan(lar) belirlendi: ${winners.map(id => `<@${id}>`).join(', ')}`,
        ephemeral: true 
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: '❌ Reroll yapılırken bir hata oluştu!', 
        ephemeral: true 
      });
    }
  }
};
