const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    // Otomatik rol verme
    const autoRoleId = global.autoRoles?.get(member.guild.id);
    if (autoRoleId) {
      try {
        const role = member.guild.roles.cache.get(autoRoleId);
        if (role) {
          await member.roles.add(role);
          console.log(`✅ ${member.user.tag} kullanıcısına otomatik rol verildi: ${role.name}`);
        }
      } catch (error) {
        console.error('Otomatik rol verme hatası:', error);
      }
    }

    // Hoş geldin mesajı (ayarlanmış kanal veya otomatik bulunan kanal)
    const customWelcomeChannelId = global.welcomeChannels?.get(member.guild.id);
    let welcomeChannel = customWelcomeChannelId 
      ? member.guild.channels.cache.get(customWelcomeChannelId)
      : member.guild.channels.cache.find(
          ch => ch.name.toLowerCase().includes('hoşgeldin') || ch.name.toLowerCase().includes('welcome')
        );

    if (welcomeChannel && welcomeChannel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('🎉 Hoş Geldin!')
        .setDescription(`**${member.user.tag}** sunucumuza katıldı!`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 Kullanıcı', value: `${member}`, inline: true },
          { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👥 Yeni Üye Sayısı', value: `${member.guild.memberCount}. üye`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) });

      await welcomeChannel.send({ embeds: [embed] }).catch(() => {});
    }

    // Log kanalına mesaj gönder
    const logChannel = member.guild.channels.cache.find(
      ch => ch.name.toLowerCase().includes('log') || ch.name.toLowerCase().includes('kayıt')
    );

    if (logChannel && logChannel.isTextBased()) {
      const logEmbed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('📥 Kullanıcı Katıldı')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı', value: `${member.user.tag} (${member.id})`, inline: false },
          { name: 'Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:f>`, inline: true },
          { name: 'Üye Sayısı', value: `${member.guild.memberCount}`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }
  }
};
