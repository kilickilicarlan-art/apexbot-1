const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucubilgi')
    .setDescription('Sunucu hakkında bilgi gösterir'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle(`📊 ${guild.name} Sunucu Bilgileri`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: '🆔 Sunucu ID', value: guild.id, inline: true },
        { name: '👑 Sahip', value: owner.user.tag, inline: true },
        { name: '📅 Kuruluş Tarihi', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Üyeler', value: `
🟢 Çevrimiçi: ${guild.members.cache.filter(m => m.presence?.status === 'online').size}
⛔ Meşgul: ${guild.members.cache.filter(m => m.presence?.status === 'dnd').size}
🌙 Rahatsız Etme: ${guild.members.cache.filter(m => m.presence?.status === 'idle').size}
⚪ Çevrimdışı: ${guild.members.cache.filter(m => !m.presence || m.presence.status === 'offline').size}
🤖 Bot: ${guild.members.cache.filter(m => m.user.bot).size}
**👤 Toplam: ${guild.memberCount}**`, inline: false },
        { name: '💬 Kanallar', value: `
💬 Yazı: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size}
🔊 Ses: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}
📋 Kategori: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size}
📢 Duyuru: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size}
**📁 Toplam: ${guild.channels.cache.size}**`, inline: true },
        { name: '🎭 Roller', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojiler', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🚀 Boost Seviyesi', value: `Seviye ${guild.premiumTier} (${guild.premiumSubscriptionCount} boost)`, inline: true },
        { name: '🔒 Doğrulama Seviyesi', value: guild.verificationLevel, inline: true }
      )
      .setImage(guild.bannerURL({ size: 1024 }))
      .setTimestamp()
      .setFooter({ text: `Talep eden: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    await interaction.reply({ embeds: [embed] });
  }
};
