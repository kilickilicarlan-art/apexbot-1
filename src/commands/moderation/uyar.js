const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const warnings = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uyar')
    .setDescription('Kullanıcıyı uyarır')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Uyarılacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Uyarı sebebi')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep');

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı!', ephemeral: true });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ Bu kullanıcıyı uyaramazsın, yetkin yetersiz!', ephemeral: true });
    }

    // Uyarıları kaydet
    const userWarnings = warnings.get(user.id) || [];
    userWarnings.push({
      reason: reason,
      moderator: interaction.user.tag,
      timestamp: new Date().toISOString()
    });
    warnings.set(user.id, userWarnings);

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⚠️ Kullanıcı Uyarıldı')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
        { name: 'Toplam Uyarı', value: `${userWarnings.length}`, inline: true },
        { name: 'Sebep', value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Kullanıcıya DM at
    try {
      await user.send(`⚠️ **${interaction.guild.name}** sunucusunda uyarıldın.\nSebep: ${reason}\nYetkili: ${interaction.user.tag}\nToplam Uyarın: ${userWarnings.length}`);
    } catch {}
  }
};

// Uyarıları dışa aktar (diğer komutlar için)
module.exports.getWarnings = () => warnings;
