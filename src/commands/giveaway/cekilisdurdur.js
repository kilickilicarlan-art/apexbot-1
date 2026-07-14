const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cekilisdurdur')
    .setDescription('Aktif çekilişi durdurur ve kazananları belirler')
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

    if (giveaway.ended) {
      return interaction.reply({ 
        content: '❌ Bu çekiliş zaten bitmiş!', 
        ephemeral: true 
      });
    }

    try {
      giveaway.ended = true;

      const channel = await interaction.client.channels.fetch(giveaway.channelId);
      const message = await channel.messages.fetch(messageId);

      // Kazananları belirle
      let winners = [];
      if (giveaway.predeterminedWinner) {
        winners = [giveaway.predeterminedWinner];
      } else if (giveaway.participants.length > 0) {
        const shuffled = [...giveaway.participants].sort(() => 0.5 - Math.random());
        winners = shuffled.slice(0, giveaway.winnerCount);
      }

      const embed = new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle('🎉 ÇEKİLİŞ BİTTİ 🎉')
        .setDescription(`**Ödül:** ${giveaway.prize}`)
        .addFields(
          { name: '🏆 Kazanan(lar)', value: winners.length > 0 ? winners.map(id => `<@${id}>`).join(', ') : 'Katılım olmadı!', inline: false },
          { name: '👤 Düzenleyen', value: `<@${giveaway.hostedBy}>`, inline: true },
          { name: '👥 Katılımcı', value: `${giveaway.participants.length}`, inline: true }
        )
        .setTimestamp();

      await message.edit({ embeds: [embed], components: [] });

      // Kazananları etiketle
      if (winners.length > 0) {
        await channel.send({
          content: `🎉 Tebrikler ${winners.map(id => `<@${id}>`).join(', ')}! **${giveaway.prize}** kazandınız!`
        });
      }

      await interaction.reply({ 
        content: '✅ Çekiliş durduruldu ve kazanan(lar) belirlendi!',
        ephemeral: true 
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: '❌ Çekiliş durdurulurken bir hata oluştu!', 
        ephemeral: true 
      });
    }
  }
};
