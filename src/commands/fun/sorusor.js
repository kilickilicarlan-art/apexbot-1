const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const responses = [
  'Evet, kesinlikle!',
  'Hayır, asla!',
  'Belki...',
  'Şüpheliyim.',
  'Kesinlikle evet!',
  'Kesinlikle hayır!',
  'Bunu söyleyemem.',
  'Tekrar sor.',
  'Olasılık yüksek.',
  'Olasılık düşük.',
  'İşaretler eveti gösteriyor.',
  'İşaretler hayırı gösteriyor.',
  'Bilmiyorum.',
  'Konsantre ol ve tekrar sor.',
  'Buna güvenebilirsin.',
  'Buna güvenme.',
  'Kararsızım.',
  'Zaman gösterecek.',
  'Evet, şüphesiz!',
  'Hayır, şüphesiz!'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sorusor')
    .setDescription('8-ball tarzı soru sor')
    .addStringOption(option =>
      option.setName('soru')
        .setDescription('Sormak istediğin soru')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('soru');
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor('#9932CC')
      .setTitle('🔮 Magic 8-Ball')
      .addFields(
        { name: 'Sorun', value: question, inline: false },
        { name: 'Cevabım', value: `**${response}**`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Soran: ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};
