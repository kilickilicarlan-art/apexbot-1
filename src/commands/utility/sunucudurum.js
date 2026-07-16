const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const https = require('https');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucudurum')
    .setDescription('Minecraft sunucu durumunu kontrol eder')
    .addStringOption(option =>
      option.setName('ip')
        .setDescription('Sunucu IP adresi (varsayılan: apexnw.net.tr)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('port')
        .setDescription('Sunucu portu (varsayılan: 25577)')
        .setRequired(false)),

  async execute(interaction) {
    const serverIP = interaction.options.getString('ip') || 'apexnw.net.tr';
    const serverPort = interaction.options.getInteger('port') || 25577;

    await interaction.reply({ 
      content: `🔍 ${serverIP}:${serverPort} sunucusu kontrol ediliyor...`, 
      ephemeral: false 
    });

    try {
      // Minecraft Server Status API
      const data = await fetchServerStatus(serverIP, serverPort);
      
      if (data.online) {
        const embed = new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('🟢 Sunucu Aktif')
          .setDescription(`**${serverIP}:${serverPort}**`)
          .addFields(
            { name: '🎮 Versiyon', value: data.version || 'Bilinmiyor', inline: true },
            { name: '👥 Oyuncular', value: `${data.players?.online || 0}/${data.players?.max || 0}`, inline: true },
            { name: '📡 Ping', value: `${data.debug?.ping || '?'}ms`, inline: true }
          )
          .setTimestamp();

        if (data.motd?.clean) {
          embed.addFields({ name: '📝 Açıklama', value: data.motd.clean.substring(0, 100), inline: false });
        }

        await interaction.editReply({ content: '', embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('🔴 Sunucu Çevrimdışı')
          .setDescription(`**${serverIP}:${serverPort}** şu an çevrimdışı veya erişilemez.`)
          .setTimestamp();

        await interaction.editReply({ content: '', embeds: [embed] });
      }

    } catch (error) {
      console.error('Sunucu durum hatası:', error);
      
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('⚠️ Sunucu Durumu Alınamadı')
        .setDescription(`**${serverIP}:${serverPort}** sunucusunun durumu kontrol edilemedi.`)
        .addFields(
          { name: 'Hata', value: 'Sunucu API\'sine ulaşılamıyor veya sunucu kapalı.', inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ content: '', embeds: [embed] });
    }
  }
};

function fetchServerStatus(ip, port) {
  return new Promise((resolve, reject) => {
    const url = `https://api.mcsrvstat.us/2/${ip}:${port}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}
