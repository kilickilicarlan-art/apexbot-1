const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Kullanıcının yasağını kaldırır')
    .addStringOption(option =>
      option.setName('kullanici_id')
        .setDescription('Yasağı kaldırılacak kullanıcının ID si')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Yasak kaldırma sebebi')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('kullanici_id');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

    try {
      const banList = await interaction.guild.bans.fetch();
      const bannedUser = banList.get(userId);

      if (!bannedUser) {
        return interaction.reply({ content: '❌ Bu kullanıcı yasaklı listesinde bulunamadı!', ephemeral: true });
      }

      await interaction.guild.members.unban(userId, `${interaction.user.tag} tarafından: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔓 Kullanıcının Yasağı Kaldırıldı')
        .addFields(
          { name: 'Kullanıcı ID', value: userId, inline: true },
          { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
          { name: 'Sebep', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Yasak kaldırılırken bir hata oluştu! ID yi kontrol et.', ephemeral: true });
    }
  }
};
