const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jokes = [
  'Adamın biri güneşte yanmış, ay da zemmiş.',
  'Kar üzerine yazı yazmak, üşenmek değil üşümektir.',
  'Seven unutmaz oğlum, eight unutmaz.',
  'Doktor bu ne der? Ekmek arası soğan.',
  'Adamın biri telefonda konuşuyormuş, ahizeden ses geliyormuş.',
  'Yarasa spor yaparsa ne olur? Pinpon.',
  'Adamın biri çok korkmuş, tırnakları çıkmış.',
  'Örümcek adam, ağ atamadığı için örümcek değil.',
  'Ben yürüyüş yapıyorum, o da sende.',
  'Sana bir şaka yaptım, ayakkabı boyası.',
  'Güvercin gülümsemeyi çok sevdiği için mi güvercin?',
  'Fare kuyruğunu neden sallar? Arkasından geleceğini bilmediği için.',
  'Benim param yok, oğlumun da pa yok.',
  'Tavuk neden yolun karşısına geçti? Öbür tarafta yemek olduğu için.',
  'Sarımsağın Türkçesi ne? Sarımsak işte başka ne olsun.',
  'Ayıdan post, İstanbuldan dost.',
  'Otobüse binen ne der? Otobüsçü mü?',
  'Çaydanlığın altı fokur fokur, bizim Orhan fokur fokur.',
  'Haydi seni de unutayım, örümcek ağını.',
  'Ayağını yorganına göre uzat, yorganı çekince üşürsün.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('espri')
    .setDescription('Rastgele bir espri söyler'),

  async execute(interaction) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('😂 Espri')
      .setDescription(joke)
      .setFooter({ text: `Komutu kullanan: ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};
