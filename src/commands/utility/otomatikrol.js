const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Otomatik rol ayarlarını sakla (productionda veritabanı kullan)
const autoRoleSettings = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('otomatikrol')
    .setDescription('Yeni gelenlere otomatik rol verme ayarlarını yönetir')
    .addSubcommand(subcommand =>
      subcommand.setName('ayarla')
        .setDescription('Otomatik rolü ayarlar')
        .addRoleOption(option =>
          option.setName('rol')
            .setDescription('Yeni üyelere verilecek rol')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('kapat')
        .setDescription('Otomatik rolü kapatır'))
    .addSubcommand(subcommand =>
      subcommand.setName('bilgi')
        .setDescription('Mevcut otomatik rol ayarlarını gösterir'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'ayarla') {
      const role = interaction.options.getRole('rol');

      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({ 
          content: '❌ Bu rolü veremem, rolüm bu rolden düşük!', 
          ephemeral: true 
        });
      }

      autoRoleSettings.set(guildId, role.id);
      // Global olarak sakla
      if (!global.autoRoles) global.autoRoles = new Map();
      global.autoRoles.set(guildId, role.id);

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Otomatik Rol Ayarlandı')
        .setDescription(`Yeni gelen üyelere otomatik olarak **${role.name}** rolü verilecek.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'kapat') {
      autoRoleSettings.delete(guildId);
      if (global.autoRoles) global.autoRoles.delete(guildId);

      await interaction.reply({ 
        content: '✅ Otomatik rol kapatıldı. Yeni üyelere otomatik rol verilmeyecek.',
        ephemeral: false 
      });

    } else if (subcommand === 'bilgi') {
      const roleId = autoRoleSettings.get(guildId) || (global.autoRoles ? global.autoRoles.get(guildId) : null);

      if (!roleId) {
        return interaction.reply({ 
          content: '❌ Otomatik rol ayarlanmamış! `/otomatikrol ayarla` ile ayarlayabilirsin.',
          ephemeral: true 
        });
      }

      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        return interaction.reply({ 
          content: '❌ Ayarlanan rol bulunamadı! Lütfen tekrar ayarlayın.',
          ephemeral: true 
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('ℹ️ Otomatik Rol Bilgisi')
        .setDescription(`Mevcut otomatik rol: **${role.name}**\nYeni üyelere bu rol otomatik verilecek.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};

// Dışa aktar (eventler için)
module.exports.getAutoRoleSettings = () => autoRoleSettings;
