const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Kullanıcının avatarını gösterir')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Avatarı görüntülenecek kullanıcı')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('sunucu')
        .setDescription('Sunucu avatarını mı göster? (sadece sunucudaki üyeler için)')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici') || interaction.user;
    const showServerAvatar = interaction.options.getBoolean('sunucu') || false;

    let avatarURL;
    let isServerAvatar = false;

    if (showServerAvatar) {
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (member && member.avatar) {
        avatarURL = member.displayAvatarURL({ dynamic: true, size: 4096 });
        isServerAvatar = true;
      } else {
        avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });
      }
    } else {
      avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🖼️ ${user.tag} ${isServerAvatar ? '(Sunucu Avatarı)' : ''}`)
      .setImage(avatarURL)
      .setTimestamp()
      .setFooter({ text: `Talep eden: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    const row = {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: 'Tarayıcıda Aç',
          url: avatarURL
        }
      ]
    };

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
