const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { spawn } = require('child_process');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botreload')
    .setDescription('Botu yeniden başlatır (komutları ve eventleri yeniden yükler)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply({ 
      content: '🔄 Bot yeniden başlatılıyor...',
      ephemeral: false 
    });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🔄 Bot Yeniden Başlatılıyor')
      .setDescription('Komutlar ve eventler yeniden yükleniyor...')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // 2 saniye bekle ve restart et
    setTimeout(() => {
      console.log('🔄 Bot yeniden başlatılıyor...');
      
      // Windows'ta yeni bir terminal penceresi aç ve botu başlat
      const cmd = spawn('cmd.exe', ['/c', 'START.bat'], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore'
      });
      
      cmd.unref();
      
      // Mevcut process'i kapat
      process.exit(0);
    }, 2000);
  }
};
