const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yardim')
    .setDescription('Bot komutlarını ve bilgilerini gösterir'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle('🍩 DonutBot - Yardım Menüsü')
      .setDescription('Sunucunuz için kapsamlı moderasyon ve eğlence botu!')
      .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { 
          name: '🛡️ Moderasyon', 
          value: '`/ban`, `/kick`, `/mute`, `/unmute`, `/unban`, `/sil`, `/uyar`, `/uyarilar`, `/sunucubilgi`',
          inline: false 
        },
        { 
          name: '🎫 Ticket Sistemi', 
          value: '`/ticketkur`, `/ticketkapat`, `/ticketekle`, `/ticketcikar`',
          inline: false 
        },
        { 
          name: '🎉 Çekiliş Sistemi', 
          value: '`/cekilis`, `/cekilisdurdur`, `/cekilissil`, `/cekilisreroll`',
          inline: false 
        },
        { 
          name: '🎭 Rol Yönetimi', 
          value: '`/rolver`, `/rolal`, `/otomatikrol`',
          inline: false 
        },
        { 
          name: '🛠️ Yardımcı Komutlar', 
          value: '`/kullanicibilgi`, `/avatar`, `/anket`, `/duyuru`',
          inline: false 
        },
        { 
          name: '🎮 Eğlence', 
          value: '`/espri`, `/zar`, `/sorusor`, `/yazitura`',
          inline: false 
        }
      )
      .setTimestamp()
      .setFooter({ 
        text: `Toplam ${interaction.client.commands.size} komut • DonutBot v1.0`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('🌐 Discord Developer Portal')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.com/developers/applications'),
        new ButtonBuilder()
          .setLabel('📖 Discord.js Dokümantasyon')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.js.org/')
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
