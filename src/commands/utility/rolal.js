const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolal')
    .setDescription('Kullanıcıdan rol alır')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Rolü alınacak kullanıcı')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Alınacak rol')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Rol alma sebebi')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const role = interaction.options.getRole('rol');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    
    if (!member) {
      return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı!', ephemeral: true });
    }

    if (role.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ Bu rolü alamazsın, yetkin yetersiz!', ephemeral: true });
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({ content: '❌ Bu kullanıcı bu role sahip değil!', ephemeral: true });
    }

    try {
      await member.roles.remove(role, `${interaction.user.tag} tarafından: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('❌ Rol Alındı')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
          { name: 'Rol', value: `${role.name} (${role.id})`, inline: true },
          { name: 'Sebep', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // Kullanıcıya DM at
      try {
        await user.send(`❌ **${interaction.guild.name}** sunucusunda **${role.name}** rolün alındı.\nYetkili: ${interaction.user.tag}`);
      } catch {}

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Rol alınırken bir hata oluştu!', ephemeral: true });
    }
  }
};
