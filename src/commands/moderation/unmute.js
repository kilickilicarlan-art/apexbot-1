const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Kullanıcının susturmasını kaldırır')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Susturması kaldırılacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Susturma kaldırma sebebi')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    
    if (!member) {
      return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı!', ephemeral: true });
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({ content: '❌ Bu kullanıcı zaten susturulmamış!', ephemeral: true });
    }

    try {
      await member.timeout(null, `${interaction.user.tag} tarafından: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔊 Kullanıcının Susturması Kaldırıldı')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
          { name: 'Sebep', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // Kullanıcıya DM at
      try {
        await user.send(`🔊 **${interaction.guild.name}** sunucusundaki susturman kaldırıldı.\nYetkili: ${interaction.user.tag}`);
      } catch {}

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Susturma kaldırılırken bir hata oluştu!', ephemeral: true });
    }
  }
};
