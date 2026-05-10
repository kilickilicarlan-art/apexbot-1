const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anket')
    .setDescription('Çoklu seçim anketi oluşturur')
    .addStringOption(option =>
      option.setName('soru')
        .setDescription('Anket sorusu')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('secenek1')
        .setDescription('1. seçenek')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('secenek2')
        .setDescription('2. seçenek')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('secenek3')
        .setDescription('3. seçenek (opsiyonel)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('secenek4')
        .setDescription('4. seçenek (opsiyonel)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('secenek5')
        .setDescription('5. seçenek (opsiyonel)')
        .setRequired(false))
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Anketin gönderileceği kanal')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const question = interaction.options.getString('soru');
    const options = [];

    for (let i = 1; i <= 5; i++) {
      const option = interaction.options.getString(`secenek${i}`);
      if (option) options.push(option);
    }

    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    let description = '';
    options.forEach((opt, index) => {
      description += `${emojis[index]} ${opt}\n`;
    });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📊 Anket')
      .setDescription(`**${question}**\n\n${description}`)
      .setTimestamp()
      .setFooter({ text: `Oluşturan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    const message = await channel.send({ embeds: [embed] });

    // Emoji ekle
    for (let i = 0; i < options.length; i++) {
      await message.react(emojis[i]);
    }

    await interaction.reply({ 
      content: `✅ Anket ${channel} kanalında oluşturuldu!`,
      ephemeral: true 
    });
  }
};
