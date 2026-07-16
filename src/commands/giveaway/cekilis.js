const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cekilis')
    .setDescription('Yeni çekiliş başlatır')
    .addStringOption(option =>
      option.setName('sure')
        .setDescription('Çekiliş süresi (örn: 1h, 1d, 1w - saat, gün, hafta)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('odul')
        .setDescription('Çekiliş ödülü')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('kazanan_sayisi')
        .setDescription('Kazanan sayısı (rastgele çekiliş için)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false))
    .addUserOption(option =>
      option.setName('kazanan')
        .setDescription('Önceden belirlenen kazanan (belirtilirse rastgele çekilis yapılmaz)')
        .setRequired(false))
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Çekilişin gönderileceği kanal (belirtilmezse bu kanal)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const duration = interaction.options.getString('sure');
    const winnerCount = interaction.options.getInteger('kazanan_sayisi') || 1;
    const predeterminedWinner = interaction.options.getUser('kazanan');
    const prize = interaction.options.getString('odul');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    const durationMs = ms(duration);
    if (!durationMs) {
      return interaction.reply({ content: '❌ Geçersiz süre formatı! Örnek: 1m, 1h, 1d, 1w', ephemeral: true });
    }

    if (durationMs > 1209600000) {
      return interaction.reply({ content: '❌ Maksimum çekiliş süresi 2 haftadır!', ephemeral: true });
    }

    if (!predeterminedWinner && !interaction.options.getInteger('kazanan_sayisi')) {
      return interaction.reply({ content: '❌ Ya kazanan sayısı belirtmelisin ya da önceden belirlenen bir kazanan seçmelisin!', ephemeral: true });
    }

    try {
      const endTime = Date.now() + durationMs;
      const endTimestamp = Math.floor(endTime / 1000);

      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('🎉 ÇEKİLİŞ 🎉')
        .setDescription(`**Ödül:** ${prize}\n\n🎉 **Katılmak için butona tıkla!**`)
        .addFields(
          { name: '⏰ Bitiş', value: `<t:${endTimestamp}:R>`, inline: true },
          { name: '👤 Düzenleyen', value: `${interaction.user}`, inline: true }
        )
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`giveaway_join_${endTime}`)
            .setLabel('🎉 Katıl')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`giveaway_info_${endTime}`)
            .setLabel(`0 Katılımcı`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

      const message = await channel.send({ embeds: [embed], components: [row] });

      // Çekilişi kaydet
      const giveawayData = {
        messageId: message.id,
        channelId: channel.id,
        guildId: interaction.guild.id,
        prize: prize,
        winnerCount: winnerCount,
        endTime: endTime,
        hostedBy: interaction.user.id,
        participants: [],
        ended: false,
        predeterminedWinner: predeterminedWinner ? predeterminedWinner.id : null
      };

      interaction.client.giveaways.set(message.id, giveawayData);

      await interaction.reply({ 
        content: `✅ Çekiliş ${channel} kanalında başlatıldı!`,
        ephemeral: true 
      });

      // Süre sonunda çekilişi bitir
      setTimeout(async () => {
        await endGiveaway(interaction.client, message.id);
      }, durationMs);

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Çekiliş başlatılırken bir hata oluştu!', ephemeral: true });
    }
  }
};

async function endGiveaway(client, messageId) {
  const giveaway = client.giveaways.get(messageId);
  if (!giveaway || giveaway.ended) return;

  giveaway.ended = true;

  try {
    const channel = await client.channels.fetch(giveaway.channelId);
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
        content: `🎉 Tebrikler ${winners.map(id => `<@${id}>`).join(', ')}! **${giveaway.prize}** kazandınız!`,
        reply: { messageReference: messageId }
      });
    }

  } catch (error) {
    console.error('Çekiliş bitirme hatası:', error);
  }
}
