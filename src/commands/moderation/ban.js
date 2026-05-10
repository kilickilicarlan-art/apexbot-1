const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Kullanıcıyı sunucudan yasaklar')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Yasaklanacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Yasaklama sebebi')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('gun')
        .setDescription('Mesajları kaç günlük silinecek (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const days = interaction.options.getInteger('gun') || 0;

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Kendini yasaklayamazsın!', ephemeral: true });
    }

    if (user.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ Beni yasaklayamazsın!', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    
    if (member) {
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: '❌ Bu kullanıcıyı yasaklayamazsın, yetkin yetersiz!', ephemeral: true });
      }
      if (!member.bannable) {
        return interaction.reply({ content: '❌ Bu kullanıcıyı yasaklayamıyorum, yetkim yetersiz!', ephemeral: true });
      }
    }

    try {
      await interaction.guild.members.ban(user, { deleteMessageDays: days, reason: `${interaction.user.tag} tarafından: ${reason}` });
      
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔨 Kullanıcı Yasaklandı')
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
        await user.send(`🔨 **${interaction.guild.name}** sunucusundan yasaklandın.\nSebep: ${reason}\nYetkili: ${interaction.user.tag}`);
      } catch {}

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Kullanıcı yasaklanırken bir hata oluştu!', ephemeral: true });
    }
  }
};
