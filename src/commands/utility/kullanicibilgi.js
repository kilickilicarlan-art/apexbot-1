const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kullanicibilgi')
    .setDescription('Kullanıcı hakkında bilgi gösterir')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Bilgisi görüntülenecek kullanıcı')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || '#5865F2')
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '🤖 Bot mu?', value: user.bot ? 'Evet' : 'Hayır', inline: true },
        { name: '📅 Hesap Oluşturulma', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Talep eden: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    if (member) {
      const roles = member.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => `<@&${role.id}>`)
        .slice(0, 10)
        .join(', ') || 'Yok';

      embed.addFields(
        { name: '📥 Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🎭 Takma Adı', value: member.nickname || 'Yok', inline: true },
        { name: '🎨 Rengi', value: member.displayHexColor, inline: true },
        { name: `🎭 Roller [${member.roles.cache.size - 1}]`, value: roles.length > 1024 ? roles.substring(0, 1021) + '...' : roles, inline: false }
      );

      if (member.premiumSince) {
        embed.addFields({
          name: '🚀 Boost Basma Tarihi',
          value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`,
          inline: true
        });
      }
    } else {
      embed.setDescription('⚠️ Bu kullanıcı sunucuda bulunmuyor!');
    }

    // Banner varsa göster
    const banner = user.bannerURL({ size: 1024 });
    if (banner) {
      embed.setImage(banner);
    }

    await interaction.reply({ embeds: [embed] });
  }
};
