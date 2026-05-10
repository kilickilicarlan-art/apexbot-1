const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Hoşgeldin kanal ayarlarını sakla
const welcomeSettings = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hosgeldinkanal')
    .setDescription('Hoşgeldin mesajlarının gideceği kanalı ayarlar')
    .addSubcommand(subcommand =>
      subcommand.setName('ayarla')
        .setDescription('Hoşgeldin kanalını ayarlar')
        .addChannelOption(option =>
          option.setName('kanal')
            .setDescription('Hoşgeldin mesajlarının gönderileceği kanal')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('kapat')
        .setDescription('Hoşgeldin mesajlarını kapatır'))
    .addSubcommand(subcommand =>
      subcommand.setName('bilgi')
        .setDescription('Mevcut hoşgeldin kanalını gösterir'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'ayarla') {
      const channel = interaction.options.getChannel('kanal');

      if (!channel.isTextBased()) {
        return interaction.reply({ 
          content: '❌ Lütfen bir yazı kanalı seçin!', 
          ephemeral: true 
        });
      }

      welcomeSettings.set(guildId, channel.id);
      // Global olarak sakla
      if (!global.welcomeChannels) global.welcomeChannels = new Map();
      global.welcomeChannels.set(guildId, channel.id);

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Hoşgeldin Kanalı Ayarlandı')
        .setDescription(`Yeni üyeler için hoşgeldin mesajları ${channel} kanalına gönderilecek.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'kapat') {
      welcomeSettings.delete(guildId);
      if (global.welcomeChannels) global.welcomeChannels.delete(guildId);

      await interaction.reply({ 
        content: '✅ Hoşgeldin mesajları kapatıldı. Yeni üyelere otomatik mesaj atılmayacak.',
        ephemeral: false 
      });

    } else if (subcommand === 'bilgi') {
      const channelId = welcomeSettings.get(guildId) || (global.welcomeChannels ? global.welcomeChannels.get(guildId) : null);

      if (!channelId) {
        return interaction.reply({ 
          content: '❌ Hoşgeldin kanalı ayarlanmamış! `/hosgeldinkanal ayarla` ile ayarlayabilirsin.',
          ephemeral: true 
        });
      }

      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.reply({ 
          content: '❌ Ayarlanan kanal bulunamadı! Lütfen tekrar ayarlayın.',
          ephemeral: true 
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('ℹ️ Hoşgeldin Kanal Bilgisi')
        .setDescription(`Mevcut hoşgeldin kanalı: ${channel}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};

// Dışa aktar (eventler için)
module.exports.getWelcomeSettings = () => welcomeSettings;
