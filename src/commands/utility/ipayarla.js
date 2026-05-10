const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Sunucu IP ayarlarını sakla
const serverIPs = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ipayarla')
    .setDescription('Sunucu IP adresini ayarlar (prefix komut için)')
    .addSubcommand(subcommand =>
      subcommand.setName('ayarla')
        .setDescription('Sunucu IP adresini ayarlar')
        .addStringOption(option =>
          option.setName('ip')
            .setDescription('Sunucu IP adresi (örn: play.apexmc.net)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('port')
            .setDescription('Sunucu portu (varsayılan: 25565)')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('aciklama')
            .setDescription('Ek açıklama (örn: 1.20.4, Survival, vb.)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand.setName('sil')
        .setDescription('Sunucu IP adresini siler'))
    .addSubcommand(subcommand =>
      subcommand.setName('bilgi')
        .setDescription('Mevcut sunucu IP adresini gösterir'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'ayarla') {
      const ip = interaction.options.getString('ip');
      const port = interaction.options.getString('port') || '25565';
      const description = interaction.options.getString('aciklama') || '';

      const ipData = {
        ip: ip,
        port: port,
        description: description
      };

      serverIPs.set(guildId, ipData);
      // Global olarak sakla
      if (!global.serverIPs) global.serverIPs = new Map();
      global.serverIPs.set(guildId, ipData);

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Sunucu IP Ayarlandı')
        .setDescription(`Sunucu IP adresi ayarlandı!\n\n**IP:** ${ip}\n**Port:** ${port}`)
        .setTimestamp();

      if (description) {
        embed.addFields({ name: 'Açıklama', value: description, inline: false });
      }

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'sil') {
      serverIPs.delete(guildId);
      if (global.serverIPs) global.serverIPs.delete(guildId);

      await interaction.reply({ 
        content: '✅ Sunucu IP adresi silindi! Artık `!ip` komutu çalışmayacak.',
        ephemeral: false 
      });

    } else if (subcommand === 'bilgi') {
      const ipData = serverIPs.get(guildId) || (global.serverIPs ? global.serverIPs.get(guildId) : null);

      if (!ipData) {
        return interaction.reply({ 
          content: '❌ Sunucu IP adresi ayarlanmamış! `/ipayarla ayarla` ile ayarlayabilirsin.',
          ephemeral: true 
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('ℹ️ Sunucu IP Bilgisi')
        .setDescription(`**IP:** ${ipData.ip}\n**Port:** ${ipData.port}`)
        .setTimestamp();

      if (ipData.description) {
        embed.addFields({ name: 'Açıklama', value: ipData.description, inline: false });
      }

      await interaction.reply({ embeds: [embed] });
    }
  }
};

// Dışa aktar (eventler için)
module.exports.getServerIPs = () => serverIPs;
