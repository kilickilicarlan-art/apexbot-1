const express = require('express');
const Database = require('./database');
const { EmbedBuilder } = require('discord.js');

class APIServer {
  constructor(client) {
    this.client = client;
    this.app = express();
    this.port = process.env.API_PORT || 3000;
    this.linkChannelId = process.env.LINK_CHANNEL_ID; // Kodların gönderileceği kanal
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    
    // Basit auth middleware
    this.app.use((req, res, next) => {
      const apiKey = req.headers['x-api-key'];
      if (apiKey !== process.env.MC_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });
  }

  setupRoutes() {
    // Sağlık kontrolü
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Yeni link kodu oluştur (Minecraft'tan çağrılır)
    this.app.post('/api/link/generate', async (req, res) => {
      try {
        const { minecraftUUID, minecraftUsername } = req.body;
        
        if (!minecraftUUID || !minecraftUsername) {
          return res.status(400).json({ error: 'Eksik parametreler' });
        }

        // Eski bağlantı var mı kontrol et
        const existing = await Database.getLinkedAccountByMinecraft(minecraftUUID);
        if (existing) {
          return res.json({ 
            alreadyLinked: true,
            discordUsername: existing.discord_username,
            message: 'Hesabın zaten bağlı!' 
          });
        }

        // Yeni kod oluştur
        const { code, expiresAt } = await Database.createLinkCode(minecraftUUID, minecraftUsername);

        // Discord kanalına mesaj gönder
        await this.sendLinkCodeToDiscord(minecraftUsername, code, expiresAt);

        res.json({ 
          success: true, 
          code,
          expiresAt,
          message: 'Kod Discord kanalına gönderildi!'
        });

      } catch (error) {
        console.error('Link kodu oluşturma hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
      }
    });

    // Bağlı hesap bilgisi sorgula
    this.app.get('/api/link/info/:minecraftUUID', async (req, res) => {
      try {
        const { minecraftUUID } = req.params;
        const account = await Database.getLinkedAccountByMinecraft(minecraftUUID);
        
        if (account) {
          res.json({
            linked: true,
            discordId: account.discord_id,
            discordUsername: account.discord_username,
            linkedAt: account.linked_at
          });
        } else {
          res.json({ linked: false });
        }
      } catch (error) {
        console.error('Bilgi sorgulama hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
      }
    });

    // Bağlantıyı kaldır (Minecraft'tan)
    this.app.post('/api/link/unlink', async (req, res) => {
      try {
        const { minecraftUUID } = req.body;
        const account = await Database.getLinkedAccountByMinecraft(minecraftUUID);
        
        if (!account) {
          return res.json({ success: false, error: 'Hesap bağlı değil' });
        }

        await Database.unlinkAccount(account.discord_id);
        res.json({ success: true, message: 'Bağlantı kaldırıldı' });
      } catch (error) {
        console.error('Unlink hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
      }
    });
  }

  async sendLinkCodeToDiscord(minecraftUsername, code, expiresAt) {
    if (!this.linkChannelId) {
      console.log('LINK_CHANNEL_ID ayarlanmamış!');
      return;
    }

    try {
      const channel = await this.client.channels.fetch(this.linkChannelId);
      if (!channel) {
        console.log('Link kanalı bulunamadı:', this.linkChannelId);
        return;
      }

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

      const embed = new EmbedBuilder()
        .setColor('#00D166')
        .setTitle('🔗 Minecraft Hesap Bağlama')
        .setDescription(`**${minecraftUsername}** adlı oyuncu Discord hesabını bağlamak istiyor!`)
        .addFields(
          { name: '🎮 Minecraft', value: minecraftUsername, inline: true },
          { name: '⏰ Kod Geçerlilik', value: `10 dakika`, inline: true }
        )
        .setFooter({ text: 'Bu senin kodun! Bağlanmak için butona tıkla.' })
        .setTimestamp();

      // Buton oluştur - tıklayınca kod giriş modalı açılacak
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`enter_code_${code}_${minecraftUsername}`)
            .setLabel('🔑 Kodunu Gir')
            .setStyle(ButtonStyle.Primary)
        );

      await channel.send({ embeds: [embed], components: [row] });
      
      // Kodu geçici olarak sakla (5 dakika sonra sil)
      setTimeout(async () => {
        try {
          const messages = await channel.messages.fetch({ limit: 10 });
          const botMessage = messages.find(m => 
            m.author.id === this.client.user.id && 
            m.components.length > 0 &&
            m.components[0].components[0].customId === `enter_code_${code}`
          );
          if (botMessage) {
            await botMessage.delete();
          }
        } catch (e) {
          // Ignore errors
        }
      }, 5 * 60 * 1000);
      console.log(`Link kodu gönderildi: ${minecraftUsername} -> ${code}`);

    } catch (error) {
      console.error('Discord mesaj gönderme hatası:', error);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🔗 Minecraft Link API çalışıyor: http://localhost:${this.port}`);
    });
  }
}

module.exports = APIServer;
