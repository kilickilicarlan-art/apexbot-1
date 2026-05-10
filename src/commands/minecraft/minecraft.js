const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription('Bağlı Minecraft hesabının bilgilerini görüntüle'),

  async execute(interaction) {
    const account = await Database.getLinkedAccountByDiscord(interaction.user.id);
    
    if (!account) {
      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('❌ Hesap Bağlı Değil')
        .setDescription('Minecraft hesabın Discord ile bağlı değil.')
        .addFields(
          { 
            name: '🔗 Nasıl Bağlanırım?', 
            value: '1. Sunucuya gir ve `/link` yaz\n2. Sana verilen kodu buraya gir\n3. `/bağlan` komutunu kullan' 
          }
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎮 Bağlı Minecraft Hesabın')
      .addFields(
        { name: '👤 Kullanıcı Adı', value: account.minecraft_username, inline: true },
        { name: '🆔 UUID', value: `\`\`\`${account.minecraft_uuid}\`\`\``, inline: true },
        { name: '🔗 Bağlanma Tarihi', value: `<t:${account.linked_at}:F>`, inline: false },
        { name: '⏰ Bağlanma', value: `<t:${account.linked_at}:R>`, inline: true }
      )
      .setFooter({ text: 'Bağlantıyı kaldırmak için /bağlantıkes kullanabilirsin' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
