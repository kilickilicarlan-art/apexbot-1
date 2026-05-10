const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Kullanıcıyı susturur (timeout)')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Susturulacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sure')
        .setDescription('Susturma süresi (örn: 1h, 1d, 7d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Susturma sebebi')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const time = interaction.options.getString('sure');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

    const duration = ms(time);
    if (!duration) {
      return interaction.reply({ content: '❌ Geçersiz süre formatı! Örnek: 1m, 1h, 1d, 7d', ephemeral: true });
    }

    if (duration > 2419200000) {
      return interaction.reply({ content: '❌ Maksimum susturma süresi 28 gündür!', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    
    if (!member) {
      return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı!', ephemeral: true });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ Bu kullanıcıyı susturamazsın, yetkin yetersiz!', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ Bu kullanıcıyı susturamıyorum, yetkim yetersiz!', ephemeral: true });
    }

    try {
      await member.timeout(duration, `${interaction.user.tag} tarafından: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🔇 Kullanıcı Susturuldu')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
          { name: 'Süre', value: time, inline: true },
          { name: 'Sebep', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // Kullanıcıya DM at
      try {
        await user.send(`🔇 **${interaction.guild.name}** sunucusunda susturuldun.\nSüre: ${time}\nSebep: ${reason}\nYetkili: ${interaction.user.tag}`);
      } catch {}

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Kullanıcı susturulurken bir hata oluştu!', ephemeral: true });
    }
  }
};
