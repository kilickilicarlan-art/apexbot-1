const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolver')
    .setDescription('Kullanıcıya rol verir')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Rol verilecek kullanıcı')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Verilecek rol')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Rol verme sebebi')
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
      return interaction.reply({ content: '❌ Bu rolü veremezsin, yetkin yetersiz!', ephemeral: true });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: '❌ Bu rolü veremiyorum, rolüm bu rolden düşük!', ephemeral: true });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ content: '❌ Bu kullanıcı zaten bu role sahip!', ephemeral: true });
    }

    try {
      await member.roles.add(role, `${interaction.user.tag} tarafından: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Rol Verildi')
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
        await user.send(`✅ **${interaction.guild.name}** sunucusunda **${role.name}** rolü verildi.\nYetkili: ${interaction.user.tag}`);
      } catch {}

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Rol verilirken bir hata oluştu!', ephemeral: true });
    }
  }
};
