const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsil')
    .setDescription('Tüm ticket kanallarını toplu olarak siler')
    .addBooleanOption(option =>
      option.setName('onay')
        .setDescription('Emin misin? Bu işlem geri alınamaz!')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const onay = interaction.options.getBoolean('onay');

    if (!onay) {
      return interaction.reply({ 
        content: '❌ Silme işlemi iptal edildi. Onay vermediğin için işlem yapılmadı.', 
        ephemeral: true 
      });
    }

    await interaction.reply({ 
      content: '🔍 Ticket kanalları aranıyor ve siliniyor...', 
      ephemeral: true 
    });

    try {
      // Ticket kanallarını bul
      const ticketChannels = interaction.guild.channels.cache.filter(
        ch => ch.name.toLowerCase().startsWith('ticket-')
      );

      if (ticketChannels.size === 0) {
        return interaction.editReply({ 
          content: '✅ Silinecek ticket kanalı bulunamadı!' 
        });
      }

      let silinen = 0;
      let hatali = 0;

      // Her birini sil
      for (const [id, channel] of ticketChannels) {
        try {
          await channel.delete('Toplu ticket silme');
          silinen++;
        } catch (error) {
          console.error(`Kanal silme hatası ${channel.name}:`, error);
          hatali++;
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('🗑️ Ticket Kanalları Silindi')
        .setDescription(`**${silinen}** ticket kanalı silindi.`)
        .setTimestamp();

      if (hatali > 0) {
        embed.addFields({ 
          name: '⚠️ Hatalar', 
          value: `${hatali} kanal silinirken hata oluştu.`, 
          inline: false 
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Toplu silme hatası:', error);
      await interaction.editReply({ 
        content: '❌ Ticket kanalları silinirken bir hata oluştu!' 
      });
    }
  }
};
