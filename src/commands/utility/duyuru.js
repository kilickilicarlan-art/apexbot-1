const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duyuru')
    .setDescription('Duyuru mesajı gönderir')
    .addStringOption(option =>
      option.setName('baslik')
        .setDescription('Duyuru başlığı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('icerik')
        .setDescription('Duyuru içeriği')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Duyurunun gönderileceği kanal (belirtilmezse bu kanal)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('renk')
        .setDescription('Embed rengi (hex kodu, örn: #FF0000)')
        .setRequired(false))
    .addAttachmentOption(option =>
      option.setName('resim')
        .setDescription('Duyuruya eklenecek resim')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const title = interaction.options.getString('baslik');
    const content = interaction.options.getString('icerik');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;
    const color = interaction.options.getString('renk') || '#5865F2';
    const image = interaction.options.getAttachment('resim');

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`📢 ${title}`)
      .setDescription(content)
      .setTimestamp()
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

    if (image) {
      embed.setImage(image.url);
    }

    await channel.send({ embeds: [embed] });

    await interaction.reply({ 
      content: `✅ Duyuru ${channel} kanalına gönderildi!`,
      ephemeral: true 
    });
  }
};
