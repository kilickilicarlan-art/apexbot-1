const { InteractionType, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

// Ticket oluşturma lock'u (çoklu tetiklemeyi engellemek için)
const ticketLocks = new Map();
// Button lock (modal açılırken çoklu tıklamayı engelle)
const buttonLocks = new Map();
// Ticket geçici verileri (modal'dan gelen)
const ticketData = new Map();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Modal submit işleme
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticket_create_modal') {
        await handleTicketModalSubmit(interaction, client);
      }
      if (interaction.customId === 'minecraft_link_modal') {
        await handleMinecraftLinkModal(interaction, client);
      }
      if (interaction.customId.startsWith('enter_code_')) {
        await handleMinecraftCodeSubmit(interaction, client);
      }
      return;
    }

    // Slash komut işleme
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Komut bulunamadı: ${interaction.commandName}`);
        return;
      }

      // Cooldown kontrolü
      const { cooldowns } = client;
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const defaultCooldownDuration = 3;
      const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          return interaction.reply({ 
            content: `⏱️ Bu komutu tekrar kullanmak için <t:${expiredTimestamp}:R> beklemelisin.`,
            ephemeral: true 
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      // Komutu çalıştır
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ 
            content: '❌ Bu komutu çalıştırırken bir hata oluştu!', 
            ephemeral: true 
          });
        } else {
          await interaction.reply({ 
            content: '❌ Bu komutu çalıştırırken bir hata oluştu!', 
            ephemeral: true 
          });
        }
      }
    }

    // Buton işleme
    if (interaction.isButton()) {
      await handleButton(interaction, client);
    }
  }
};

async function handleButton(interaction, client) {
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  // Çekiliş katılma butonu
  if (interaction.customId.startsWith('giveaway_join_')) {
    await handleGiveawayJoin(interaction, client);
    return;
  }
  
  // Ticket oluşturma butonu - Modal göster (button lock ile)
  if (interaction.customId === 'create_ticket') {
    const buttonLockKey = `button-${interaction.user.id}`;
    
    // Eğer buton zaten işleniyorsa, görmezden gel
    if (buttonLocks.has(buttonLockKey)) {
      return;
    }
    
    // Lock ekle ve işle
    buttonLocks.set(buttonLockKey, true);
    
    try {
      await showTicketModal(interaction, client);
    } finally {
      // 2 saniye sonra lock'u kaldır (debound)
      setTimeout(() => {
        buttonLocks.delete(buttonLockKey);
      }, 2000);
    }
  }
  
  // Minecraft link butonu - modal aç
  if (interaction.customId.startsWith('enter_code_')) {
    await showMinecraftCodeModal(interaction, client);
  }
  
  // Ticket kapatma butonu (ticket kanalındaki kapat butonu)
  if (interaction.customId === 'close_ticket_button') {
    // Kapatma onayı için yeni bir embed göster
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    
    const confirmEmbed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🔒 Ticket Kapatma Onayı')
      .setDescription('Bu ticketı kapatmak istediğine emin misin?')
      .setTimestamp();
    
    const confirmRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_close_ticket')
          .setLabel('✅ Evet, Kapat')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_close_ticket')
          .setLabel('❌ İptal')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmRow]
    });
  }
  
  // Ticket kapatma onay butonu
  if (interaction.customId === 'confirm_close_ticket') {
    await handleTicketClose(interaction, client);
  }
  
  // Ticket kapatma iptal butonu
  if (interaction.customId === 'cancel_close_ticket') {
    await interaction.update({
      content: '❌ Ticket kapatma iptal edildi.',
      embeds: [],
      components: []
    });
  }
  
  // Minecraft hesap bağlantı kesme onay
  if (interaction.customId === 'confirm_unlink') {
    const Database = require('../utils/database');
    const { EmbedBuilder } = require('discord.js');
    
    try {
      const result = await Database.unlinkAccount(interaction.user.id);
      
      if (result.changes > 0) {
        const embed = new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('✅ Bağlantı Kaldırıldı')
          .setDescription('Minecraft hesabın Discord ile bağlantısı kaldırıldı.');
        
        await interaction.update({ embeds: [embed], components: [] });
      } else {
        await interaction.update({ 
          content: '❌ Bağlı hesap bulunamadı!',
          embeds: [],
          components: []
        });
      }
    } catch (error) {
      console.error('Unlink hatası:', error);
      await interaction.update({
        content: '❌ Bir hata oluştu!',
        embeds: [],
        components: []
      });
    }
  }
  
  // Minecraft hesap bağlantı kesme iptal
  if (interaction.customId === 'cancel_unlink') {
    await interaction.update({
      content: '❌ İşlem iptal edildi.',
      embeds: [],
      components: []
    });
  }
  
  // Ticket bilgi butonu
  if (interaction.customId === 'ticket_info') {
    await interaction.reply({
      content: '🎫 **Ticket Sistemi Hakkında**\n\nTicket sistemi, sunucu yetkilileriyle özel iletişim kurmanı sağlar.\n\n**Nasıl kullanılır?**\n1. "Ticket Aç" butonuna tıkla\n2. Özel bir kanal oluşturulacak\n3. Sorununuzu detaylı yazın\n4. Yetkili yanıt verene kadar bekleyin\n\n**Kurallar:**\n- Spam yapmayın\n- Sabırlı olun\n- Yetkililere saygılı olun',
      ephemeral: true
    });
  }
}

async function handleGiveawayJoin(interaction, client) {
  const messageId = interaction.message.id;
  const giveaway = client.giveaways.get(messageId);
  
  if (!giveaway) {
    return interaction.reply({ 
      content: '❌ Bu çekiliş artık aktif değil!', 
      ephemeral: true 
    });
  }
  
  if (giveaway.ended) {
    return interaction.reply({ 
      content: '❌ Bu çekiliş zaten bitti!', 
      ephemeral: true 
    });
  }
  
  if (giveaway.participants.includes(interaction.user.id)) {
    // Katılımcıyı çıkar (toggle)
    giveaway.participants = giveaway.participants.filter(id => id !== interaction.user.id);
    
    await interaction.reply({ 
      content: '🎉 Çekilişten ayrıldın!', 
      ephemeral: true 
    });
  } else {
    // Katılımcı ekle
    giveaway.participants.push(interaction.user.id);
    
    await interaction.reply({ 
      content: '🎉 Çekilişe katıldın! Bol şans!', 
      ephemeral: true 
    });
  }
  
  // Butonu güncelle
  try {
    const channel = await client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(messageId);
    const embed = message.embeds[0];
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway_join_${giveaway.endTime}`)
          .setLabel('🎉 Katıl')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`giveaway_info_${giveaway.endTime}`)
          .setLabel(`${giveaway.participants.length} Katılımcı`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    
    await message.edit({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Çekiliş buton güncelleme hatası:', error);
  }
}

async function showTicketModal(interaction, client) {
  const guild = interaction.guild;
  const user = interaction.user;
  
  // Mevcut ticket kontrolü
  const existingChannel = guild.channels.cache.find(
    ch => ch.name.startsWith(`ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`)
  );

  if (existingChannel) {
    return interaction.reply({
      content: `❌ Zaten açık bir ticketın var: ${existingChannel}`,
      ephemeral: true
    });
  }

  // Modal oluştur
  const modal = new ModalBuilder()
    .setCustomId('ticket_create_modal')
    .setTitle('🎫 Ticket Oluştur');

  // Başlık inputu
  const titleInput = new TextInputBuilder()
    .setCustomId('ticket_title')
    .setLabel('Ticket Başlığı')
    .setPlaceholder('Örn: Ban sorunu, Teknik destek, Başvuru...')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setMinLength(3)
    .setRequired(true);

  // Öncelik inputu (dropdown yerine text input ile yapacağız)
  const priorityInput = new TextInputBuilder()
    .setCustomId('ticket_priority')
    .setLabel('Öncelik (Düşük / Orta / Yüksek / Acil)')
    .setPlaceholder('Örn: Yüksek')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(10)
    .setMinLength(3)
    .setRequired(true);

  // Açıklama inputu
  const descriptionInput = new TextInputBuilder()
    .setCustomId('ticket_description')
    .setLabel('Sorununuzu Detaylı Açıklayın')
    .setPlaceholder('Ne yaşadığınızı detaylı yazın...')
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(1000)
    .setMinLength(10)
    .setRequired(true);

  // Row'ları oluştur
  const firstRow = new ActionRowBuilder().addComponents(titleInput);
  const secondRow = new ActionRowBuilder().addComponents(priorityInput);
  const thirdRow = new ActionRowBuilder().addComponents(descriptionInput);

  // Modal'a ekle
  modal.addComponents(firstRow, secondRow, thirdRow);

  // Modal'ı göster
  await interaction.showModal(modal);
}

async function handleTicketModalSubmit(interaction, client) {
  const guild = interaction.guild;
  const user = interaction.user;
  const lockKey = `${guild.id}-${user.id}`;
  
  // Çoklu tetiklemeyi engelle - hemen cevap vererek işlemi başlat
  if (ticketLocks.has(lockKey)) {
    return interaction.reply({
      content: '⏳ Zaten bir ticket oluşturma işlemin devam ediyor...',
      ephemeral: true
    });
  }
  
  // Lock ekle - hemen kilitle ki başka istekler engellensin
  ticketLocks.set(lockKey, Date.now());
  
  // Cevabı ertele
  await interaction.deferReply({ ephemeral: true });
  
  // Modal verilerini al
  const title = interaction.fields.getTextInputValue('ticket_title');
  const priority = interaction.fields.getTextInputValue('ticket_priority');
  const description = interaction.fields.getTextInputValue('ticket_description');
  
  // Ticket ayarlarını al
  const settings = global.ticketSettings?.get(guild.id);
  
  if (!settings) {
    ticketLocks.delete(lockKey);
    return interaction.editReply({
      content: '❌ Ticket sistemi henüz kurulmamış! Bir yetkiliye başvurun.'
    });
  }

  // Mevcut ticket kontrolü - kanal oluşturmadan önce tekrar kontrol et
  const existingChannel = guild.channels.cache.find(
    ch => ch.name.startsWith(`ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`)
  );

  if (existingChannel) {
    ticketLocks.delete(lockKey);
    return interaction.editReply({
      content: `❌ Zaten açık bir ticketın var: ${existingChannel}`
    });
  }

  // Öncelik rengi ve emoji belirle
  let priorityEmoji = '⚪';
  let priorityColor = '#5865F2';
  
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes('düşük') || priorityLower.includes('dusuk')) {
    priorityEmoji = '🟢';
    priorityColor = '#57F287';
  } else if (priorityLower.includes('orta')) {
    priorityEmoji = '🟡';
    priorityColor = '#FEE75C';
  } else if (priorityLower.includes('yüksek') || priorityLower.includes('yuksek')) {
    priorityEmoji = '🟠';
    priorityColor = '#FFA500';
  } else if (priorityLower.includes('acil')) {
    priorityEmoji = '🔴';
    priorityColor = '#ED4245';
  }

  // Kanal adı oluştur (başlıktan) - benzersiz timestamp ekle
  const timestamp = Date.now().toString(36).slice(-4);
  const safeTitle = title.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 15);
  const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${safeTitle}-${timestamp}`;
  
  try {
    // Benzersiz kanal adı kullan
    const ticketChannel = await guild.channels.create({
      name: channelName.substring(0, 100), // Discord limit: 100 karakter
      type: 0, // TextChannel
      parent: settings.category,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ['ViewChannel']
        },
        {
          id: user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks']
        },
        {
          id: settings.supportRole,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages']
        },
        {
          id: client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ReadMessageHistory']
        }
      ]
    });

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    
    const embed = new EmbedBuilder()
      .setColor(priorityColor)
      .setTitle(`${priorityEmoji} ${title}`)
      .setDescription(`**Açıklama:**\n${description}`)
      .addFields(
        { name: '👤 Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
        { name: '📊 Öncelik', value: `${priorityEmoji} ${priority}`, inline: true },
        { name: '⏰ Açılış', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket_button')
          .setLabel('🔒 Ticketı Kapat')
          .setStyle(ButtonStyle.Danger)
      );

    await ticketChannel.send({ 
      content: `<@${user.id}> | <@&${settings.supportRole}>`,
      embeds: [embed], 
      components: [row] 
    });

    await interaction.editReply({
      content: `✅ Ticketın açıldı: ${ticketChannel}\n📋 **Başlık:** ${title}\n📊 **Öncelik:** ${priorityEmoji} ${priority}`
    });

  } catch (error) {
    console.error('Ticket oluşturma hatası:', error);
    await interaction.editReply({
      content: '❌ Ticket oluşturulurken bir hata oluştu!'
    });
  } finally {
    // Her durumda lock'u kaldır
    ticketLocks.delete(lockKey);
  }
}

async function handleTicketCreate(interaction, client) {
  // Bu fonksiyon artık kullanılmıyor, yerine showTicketModal kullanılıyor
  await showTicketModal(interaction, client);
}

async function handleTicketClose(interaction, client) {
  const channel = interaction.channel;
  
  await interaction.update({
    content: '🔒 Ticket kapatılıyor...',
    embeds: [],
    components: []
  });

  // 5 saniye bekle ve kanalı sil
  setTimeout(async () => {
    try {
      await channel.delete('Ticket kapatıldı');
    } catch (error) {
      console.error('Ticket kapatma hatası:', error);
    }
  }, 5000);
}

async function handleMinecraftLinkModal(interaction, client) {
  const Database = require('../utils/database');
  const { EmbedBuilder } = require('discord.js');
  
  const code = interaction.fields.getTextInputValue('link_code');
  
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const result = await Database.verifyLinkCode(
      code, 
      interaction.user.id, 
      interaction.user.username
    );
    
    if (result.success) {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Hesap Bağlandı!')
        .setDescription(`Minecraft hesabın başarıyla Discord'a bağlandı.`)
        .addFields(
          { name: '🎮 Minecraft', value: result.minecraftUsername, inline: true },
          { name: '💬 Discord', value: interaction.user.username, inline: true },
          { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: '/minecraft komutu ile bilgilerini görüntüleyebilirsin' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      
      console.log(`Hesap bağlandı: ${result.minecraftUsername} <-> ${interaction.user.username}`);
    } else {
      await interaction.editReply({
        content: `❌ ${result.error || 'Kod geçersiz veya süresi dolmuş!'}`
      });
    }
  } catch (error) {
    console.error('Minecraft link hatası:', error);
    await interaction.editReply({
      content: '❌ Hesap bağlama sırasında bir hata oluştu!'
    });
  }
}

// Minecraft kod giriş modalı göster
async function showMinecraftCodeModal(interaction, client) {
  const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
  
  // Buton ID'sinden kod ve username'i ayıkla: enter_code_CODE_USERNAME
  const parts = interaction.customId.split('_');
  const code = parts[2];
  const minecraftUsername = parts.slice(3).join('_');
  
  const modal = new ModalBuilder()
    .setCustomId(`enter_code_${code}_${minecraftUsername}`)
    .setTitle('🔑 Minecraft Kodunu Gir');

  const codeInput = new TextInputBuilder()
    .setCustomId('enter_code_value')
    .setLabel('Doğrulama Kodu')
    .setPlaceholder('Kodu buraya yaz...')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(6)
    .setMinLength(6)
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(codeInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}

// Minecraft kod submit işle
async function handleMinecraftCodeSubmit(interaction, client) {
  const Database = require('../utils/database');
  const { EmbedBuilder } = require('discord.js');
  
  const enteredCode = interaction.fields.getTextInputValue('enter_code_value');
  const originalCode = interaction.customId.replace('minecraft_enter_code_', '');
  
  // Kod eşleşmesini kontrol et
  if (enteredCode.toUpperCase() !== originalCode.toUpperCase()) {
    return interaction.reply({
      content: '❌ Girdiğin kod yanlış! Lütfen doğru kodu gir.',
      ephemeral: true
    });
  }
  
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const result = await Database.verifyLinkCode(
      originalCode, 
      interaction.user.id, 
      interaction.user.username
    );
    
    if (result.success) {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Hesap Bağlandı!')
        .setDescription(`Minecraft hesabın başarıyla Discord'a bağlandı.`)
        .addFields(
          { name: '🎮 Minecraft', value: result.minecraftUsername, inline: true },
          { name: '💬 Discord', value: interaction.user.username, inline: true },
          { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: '/minecraft komutu ile bilgilerini görüntüleyebilirsin' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      
      // Başarılı mesajını kanala da at (opsiyonel)
      try {
        const channel = interaction.channel;
        const publicEmbed = new EmbedBuilder()
          .setColor('#00D166')
          .setTitle('🎉 Yeni Hesap Bağlandı!')
          .setDescription(`**${interaction.user.username}** adlı Discord kullanıcısı **${result.minecraftUsername}** Minecraft hesabını bağladı!`)
          .setTimestamp();
        await channel.send({ embeds: [publicEmbed] });
      } catch (e) {
        // Kanala gönderme hatası görmezden gel
      }
      
      console.log(`Hesap bağlandı: ${result.minecraftUsername} <-> ${interaction.user.username}`);
    } else {
      await interaction.editReply({
        content: `❌ ${result.error || 'Kod geçersiz veya süresi dolmuş!'}`
      });
    }
  } catch (error) {
    console.error('Minecraft link hatası:', error);
    await interaction.editReply({
      content: '❌ Hesap bağlama sırasında bir hata oluştu!'
    });
  }
}

// Minecraft direkt bağlama (butona basınca hemen bağlan)
async function handleMinecraftDirectLink(interaction, client) {
  const Database = require('../utils/database');
  const { EmbedBuilder } = require('discord.js');
  
  // Buton ID'sinden kod ve username'i ayıkla: link_account_CODE_USERNAME
  const parts = interaction.customId.split('_');
  const code = parts[2];
  const minecraftUsername = parts.slice(3).join('_');
  
  try {
    await interaction.deferReply({ ephemeral: true });
    
    const result = await Database.verifyLinkCode(
      code, 
      interaction.user.id, 
      interaction.user.username
    );
    
    if (result.success) {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Hesap Bağlandı!')
        .setDescription(`**${minecraftUsername}** Minecraft hesabın Discord'a bağlandı.`)
        .addFields(
          { name: '🎮 Minecraft', value: minecraftUsername, inline: true },
          { name: '💬 Discord', value: interaction.user.username, inline: true }
        )
        .setFooter({ text: '/minecraft komutu ile bilgilerini gör' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      console.log(`Direkt bağlama: ${minecraftUsername} <-> ${interaction.user.username}`);
    } else {
      await interaction.editReply({
        content: `❌ ${result.error || 'Kod geçersiz!'}`
      });
    }
  } catch (error) {
    console.error('Direkt bağlama hatası:', error);
    await interaction.editReply({
      content: '❌ Bir hata oluştu!'
    });
  }
}
