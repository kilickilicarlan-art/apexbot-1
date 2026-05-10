const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Database = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bağlantıkes')
    .setDescription('Minecraft hesap bağlantını kaldır'),

  async execute(interaction) {
    const account = await Database.getLinkedAccountByDiscord(interaction.user.id);
    
    if (!account) {
      return interaction.reply({
        content: '❌ Zaten bağlı bir Minecraft hesabın yok!',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('⚠️ Bağlantıyı Kaldır?')
      .setDescription(`**${account.minecraft_username}** hesabının bağlantısını kaldırmak istediğine emin misin?`)
      .setFooter({ text: 'Bu işlem geri alınamaz!'});

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_unlink')
          .setLabel('✅ Evet, Kaldır')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_unlink')
          .setLabel('❌ İptal')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      ephemeral: true 
    });
  }
};
