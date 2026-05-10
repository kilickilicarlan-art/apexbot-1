const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kullanıcıyı sunucudan atar')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Atılacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Atılma sebebi')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Kendini atamazsın!', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    
    if (!member) {
      return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı!', ephemeral: true });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ Bu kullanıcıyı atamazsın, yetkin yetersiz!', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ Bu kullanıcıyı atamıyorum, yetkim yetersiz!', ephemeral: true });
    }

    try {
      await member.kick(`${interaction.user.tag} tarafından: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('👢 Kullanıcı Atıldı')
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
        await user.send(`👢 **${interaction.guild.name}** sunucusundan atıldın.\nSebep: ${reason}\nYetkili: ${interaction.user.tag}`);
      } catch {}

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Kullanıcı atılırken bir hata oluştu!', ephemeral: true });
    }
  }
};
