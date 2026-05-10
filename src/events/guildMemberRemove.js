const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    // Log kanalına mesaj gönder
    const logChannel = member.guild.channels.cache.find(
      ch => ch.name.toLowerCase().includes('log') || ch.name.toLowerCase().includes('kayıt')
    );

    if (logChannel && logChannel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('📤 Kullanıcı Ayrıldı')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı', value: `${member.user.tag} (${member.id})`, inline: false },
          { name: 'Sunucuya Katılma', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>` : 'Bilinmiyor', inline: true },
          { name: 'Kalan Üye Sayısı', value: `${member.guild.memberCount}`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
  }
};
