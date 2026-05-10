const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bağlan')
    .setDescription('Minecraft hesabını Discord ile bağla'),

  async execute(interaction) {
    // Kullanıcının zaten bağlı hesabı var mı kontrol et
    const existing = await Database.getLinkedAccountByDiscord(interaction.user.id);
    
    if (existing) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('⚠️ Zaten Bağlı Hesabın Var')
        .setDescription(`Minecraft hesabın **${existing.minecraft_username}** zaten bağlı.`)
        .addFields(
          { name: '🎮 Minecraft', value: existing.minecraft_username, inline: true },
          { name: '🔗 Bağlanma Tarihi', value: `<t:${existing.linked_at}:R>`, inline: true }
        )
        .setFooter({ text: 'Yeni hesap bağlamak için önce /bağlantıkes komutunu kullan' });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Kod giriş modalı göster
    const modal = new ModalBuilder()
      .setCustomId('minecraft_link_modal')
      .setTitle('🔗 Minecraft Hesap Bağlama');

    const codeInput = new TextInputBuilder()
      .setCustomId('link_code')
      .setLabel('Minecraft Doğrulama Kodu')
      .setPlaceholder('Örn: ABC123')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(6)
      .setMinLength(6)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(codeInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
