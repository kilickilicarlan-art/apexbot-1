const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Uyarı verilerini paylaşmak için
const warnings = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uyarilar')
    .setDescription('Kullanıcının uyarılarını gösterir')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Uyarıları görüntülenecek kullanıcı')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici') || interaction.user;
    
    // Global uyarı verilerini al
    const warnModule = require('./uyar.js');
    const allWarnings = warnModule.getWarnings ? warnModule.getWarnings() : warnings;
    
    const userWarnings = allWarnings.get(user.id) || [];

    if (userWarnings.length === 0) {
      return interaction.reply({ content: `✅ ${user.tag} için hiç uyarı bulunamadı!`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`⚠️ ${user.tag} - Uyarı Geçmişi`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Toplam **${userWarnings.length}** uyarı`)
      .setTimestamp();

    userWarnings.slice(-10).forEach((warn, index) => {
      embed.addFields({
        name: `Uyarı #${index + 1}`,
        value: `Sebep: ${warn.reason}\nYetkili: ${warn.moderator}\nTarih: ${new Date(warn.timestamp).toLocaleString('tr-TR')}`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
};
