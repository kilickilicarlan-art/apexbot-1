const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketkur')
    .setDescription('Ticket sistemi kurar')
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Ticket mesajının gönderileceği kanal')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Ticketlara bakacak yetkili rolü')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('baslik')
        .setDescription('Ticket embed başlığı')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('aciklama')
        .setDescription('Ticket embed açıklaması')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal');
    const role = interaction.options.getRole('rol');
    const title = interaction.options.getString('baslik') || '🎫 Ticket Sistemi';
    const description = interaction.options.getString('aciklama') || 'Bir sorun mu var? Yetkililerle iletişime geçmek için aşağıdaki butona tıkla!';

    await interaction.deferReply({ ephemeral: true });

    let silinen = 0;
    try {
      // Kanaldaki eski bot mesajlarını temizle (ticket sistem mesajları)
      const messages = await channel.messages.fetch({ limit: 100 });
      
      for (const [id, msg] of messages) {
        // Botun mesajları mı ve ticket embedi mi kontrol et
        if (msg.author.id === interaction.client.user.id) {
          let isTicketMessage = false;
          
          // Embed başlığında Ticket geçiyor mu?
          if (msg.embeds.length > 0 && msg.embeds[0].title) {
            if (msg.embeds[0].title.toLowerCase().includes('ticket')) {
              isTicketMessage = true;
            }
          }
          
          // Veya buton var mı ve ticket butonu mu?
          if (msg.components && msg.components.length > 0) {
            const hasTicketButton = msg.components.some(row => 
              row.components.some(btn => 
                btn.customId === 'create_ticket' || btn.customId === 'ticket_info'
              )
            );
            if (hasTicketButton) isTicketMessage = true;
          }
          
          if (isTicketMessage) {
            try {
              await msg.delete();
              silinen++;
            } catch (err) {
              // Mesaj çok eskiyse veya silinemezse
              console.log(`Mesaj silinemedi ${id}:`, err.message);
            }
          }
        }
      }
    } catch (error) {
      console.log('Eski mesajlar temizlenirken hata:', error);
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(title)
      .setDescription(description)
      .addFields(
        { name: '📋 Nasıl Kullanılır?', value: 'Aşağıdaki "Ticket Aç" butonuna tıklayarak özel bir kanal oluşturabilirsin.', inline: false },
        { name: '⏱️ Yanıt Süresi', value: 'Ticketlar genellikle 24 saat içinde yanıtlanır.', inline: false },
        { name: '📌 Önemli', value: 'Lütfen ticket açmadan önce sorununuzu açıkça belirtin.', inline: false }
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: interaction.guild.name });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('🎫 Ticket Aç')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ticket_info')
          .setLabel('ℹ️ Bilgi')
          .setStyle(ButtonStyle.Secondary)
      );

    await channel.send({ embeds: [embed], components: [row] });

    // Yetkili rolünü global olarak sakla (basit çözüm - productionda veritabanı kullan)
    if (!global.ticketSettings) global.ticketSettings = new Map();
    global.ticketSettings.set(interaction.guild.id, {
      supportRole: role.id,
      category: channel.parentId || null
    });

    await interaction.editReply({ 
      content: `✅ Ticket sistemi ${channel} kanalına kuruldu! (${silinen} eski mesaj silindi)\nYetkili rolü: ${role}` 
    });
  }
};
