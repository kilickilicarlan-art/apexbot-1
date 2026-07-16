const { Collection, EmbedBuilder } = require('discord.js');

// Link engelleme ve küfür filtreleme sistemi
const badWords = ['amk', 'amq', 'aq', 'oç', 'sik', 'sikik', 'piç', 'pezevenk', 'orospu', 'oruspu', 'yarrak', 'göt', 'amcık', 'yavşak', 'şerefsiz', 'pezevenk'];

// Prefix komutlar
const prefix = '!';

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    // Bot mesajlarını ve DM'leri yoksay
    if (message.author.bot || !message.guild) return;

    // Prefix komut kontrolü
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      // !ip komutu - DM'den gönderir
      if (command === 'ip') {
        try {
          const serverIP = 'apexnw.net.tr'; // Sunucu IP adresi
          const embed = new EmbedBuilder()
            .setColor('#00B5FF')
            .setTitle('🎮 Sunucu IP Adresi')
            .setDescription(`**${serverIP}**\n\nSunucumuza katılmak için bu IP'yi kullanabilirsin!`)
            .setTimestamp();

          // Kullanıcıya DM at
          await message.author.send({ embeds: [embed] });
          
          // Kanala bilgi mesajı at (5 saniye sonra silinir)
          const infoMsg = await message.reply({ 
            content: '📩 IP adresi sana DM olarak gönderildi!' 
          });
          
          setTimeout(() => {
            infoMsg.delete().catch(() => {});
            message.delete().catch(() => {});
          }, 5000);
          
        } catch (error) {
          // DM kapalıysa kanala yaz
          await message.reply({ 
            content: '❌ DM gönderilemedi! Lütfen DM aç veya komutu tekrar dene.' 
          });
        }
        return;
      }
    }

    // Küfür filtresi
    const messageContent = message.content.toLowerCase();
    const hasBadWord = badWords.some(word => messageContent.includes(word));

    if (hasBadWord) {
      try {
        await message.delete();
        
        const warningMsg = await message.channel.send({
          content: `⚠️ ${message.author} lütfen küfür kullanma!`
        });

        setTimeout(() => warningMsg.delete().catch(() => {}), 5000);

        // Log kanalına gönder
        const logChannel = message.guild.channels.cache.find(
          ch => ch.name.toLowerCase().includes('log') || ch.name.toLowerCase().includes('mod-log')
        );

        if (logChannel && logChannel.isTextBased()) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⚠️ Küfür Filtresi')
            .setDescription(`**${message.author.tag}** küfür kullanmaya çalıştı.`)
            .addFields(
              { name: 'Kanal', value: `${message.channel}`, inline: true },
              { name: 'Mesaj', value: message.content.substring(0, 1000), inline: false }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [embed] }).catch(() => {});
        }

      } catch (error) {
        console.error('Mesaj silme hatası:', error);
      }
    }
  }
};
