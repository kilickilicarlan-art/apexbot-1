const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketmesajsil')
    .setDescription('Ticket kanalındaki tüm bot mesajlarını manuel olarak siler')
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Mesajların silineceği kanal (boş bırakılırsa bu kanal)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    await interaction.reply({ 
      content: '🔍 Ticket mesajları aranıyor ve siliniyor...', 
      ephemeral: true 
    });

    try {
      let silinen = 0;
      let toplam = 0;
      
      // Son 100 mesajı getir
      const messages = await channel.messages.fetch({ limit: 100 });
      
      for (const [id, msg] of messages) {
        // Botun kendi mesajları mı kontrol et
        if (msg.author.id === interaction.client.user.id) {
          toplam++;
          try {
            // Ticket mesajı mı kontrol et (embed varsa ve başlığında Ticket geçiyorsa)
            if (msg.embeds.length > 0 && msg.embeds[0].title && msg.embeds[0].title.toLowerCase().includes('ticket')) {
              await msg.delete();
              silinen++;
            }
          } catch (error) {
            console.log(`Mesaj silinemedi ${id}:`, error.message);
          }
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('🗑️ Ticket Mesajları Temizlendi')
        .setDescription(`**${silinen}** ticket mesajı silindi.`)
        .addFields(
          { name: 'Toplam Kontrol Edilen', value: `${toplam}`, inline: true },
          { name: 'Silinen', value: `${silinen}`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      await interaction.editReply({ 
        content: `❌ Mesajlar silinirken hata oluştu: ${error.message}` 
      });
    }
  }
};
