# 🍩 DonutBot - Kapsamlı Discord Botu

Kendi Discord sunucunuz için tüm temel özellikleri içeren profesyonel bir Discord botu.

## ✨ Özellikler

### 🛡️ Moderasyon
- `/ban` - Kullanıcı yasaklama (mesaj silme seçeneğiyle)
- `/kick` - Kullanıcı atma
- `/mute` - Kullanıcı susturma (timeout)
- `/unmute` - Susturma kaldırma
- `/unban` - Yasak kaldırma
- `/sil` - Toplu mesaj silme
- `/uyar` - Kullanıcı uyarma
- `/uyarilar` - Uyarı geçmişi görüntüleme
- `/sunucubilgi` - Sunucu istatistikleri

### 🎫 Ticket Sistemi
- `/ticketkur` - Ticket sistemi kurulumu
- `/ticketkapat` - Ticket kapatma
- `/ticketekle` - Ticket açan kullanıcı ekleme
- `/ticketcikar` - Kullanıyı ticket'tan çıkarma

### 🎉 Çekiliş Sistemi
- `/cekilis` - Yeni çekiliş başlatma
- `/cekilisdurdur` - Aktif çekilişi durdurma
- `/cekilissil` - Çekiliş silme
- `/cekilisreroll` - Yeni kazanan belirleme

### 🎭 Rol Yönetimi
- `/rolver` - Kullanıcıya rol verme
- `/rolal` - Kullanıcıdan rol alma
- `/otomatikrol` - Yeni üyelere otomatik rol verme

### 🛠️ Yardımcı Komutlar
- `/kullanicibilgi` - Kullanıcı bilgisi
- `/avatar` - Avatar görüntüleme (sunucu/global seçeneğiyle)
- `/anket` - Anket oluşturma
- `/duyuru` - Duyuru gönderme

### 🎮 Eğlence
- `/espri` - Rastgele espri
- `/zar` - Zar atma (özelleştirilebilir)
- `/sorusor` - 8-ball tarzı soru
- `/yazitura` - Yazı tura

## 🚀 Kurulum

### 1. Gerekli Programlar
- [Node.js](https://nodejs.org/) (v18 veya üstü)
- Bir metin editörü (VS Code önerilir)

### 2. Discord Bot Oluşturma

1. [Discord Developer Portal](https://discord.com/developers/applications)'a git
2. "New Application" butonuna tıkla ve bir isim ver
3. Sol menüden "Bot" sekmesine git
4. "Add Bot" butonuna tıkla
5. Token kısmından "Reset Token" ve token'i kopyala
6. **Privileged Gateway Intents** bölümünden şunları AÇ:
   - ☑️ PRESENCE INTENT
   - ☑️ SERVER MEMBERS INTENT
   - ☑️ MESSAGE CONTENT INTENT
7. Sol menüden "OAuth2" → "URL Generator" git
8. Scopes: `bot`, `applications.commands`
9. Bot Permissions: `Administrator` (veya istediğin izinleri seç)
10. Oluşan URL'yi kopyala ve tarayıcıda açarak botu sunucuna ekle

### 3. Bot Kurulumu

```bash
# 1. Proje klasörüne git
cd DonutBot

# 2. Bağımlılıkları yükle
npm install

# 3. .env dosyasını oluştur
# .env.example dosyasını kopyalayarak .env oluştur
# Windows:
copy .env.example .env
# veya Mac/Linux:
cp .env.example .env

# 4. .env dosyasını düzenle ve bilgileri gir:
# BOT_TOKEN=discord_bot_tokenin
# CLIENT_ID=discord_application_id
# GUILD_ID=sunucu_id (opsiyonel)
```

### 4. Slash Komutları Kaydetme

```bash
# Hızlı test için (sadece belirli sunucu - hemen çalışır):
npm run deploy-guild

# Global olarak (tüm sunucular - 1 saat yayılma süresi):
npm run deploy
```

### 5. Botu Başlatma

```bash
# Normal başlatma
npm start

# Geliştirme modu (değişikliklerde otomatik yeniden başlatma)
npm run dev
```

## 🔧 Gelişmiş Özellikler

### Otomatik Rol Verme
```
/otomatikrol ayarla @rol
```
Yeni üyelere otomatik rol verir.

### Küfür Filtresi
Bot otomatik olarak belirlenen kelimeleri içeren mesajları siler ve uyarı verir.

### Hoş Geldin Mesajları
`hoşgeldin` veya `welcome` içeren bir kanal varsa otomatik mesaj atar.

### Log Sistemi
`log`, `kayıt` veya `mod-log` içeren kanallara otomatik log gönderir.

## 📋 Komut Listesi Tablosu

| Kategori | Komut | Açıklama |
|----------|-------|----------|
| Moderasyon | `/ban` | Kullanıcı yasakla |
| Moderasyon | `/kick` | Kullanıcı at |
| Moderasyon | `/mute` | Kullanıcı sustur |
| Moderasyon | `/unmute` | Susturmayı kaldır |
| Moderasyon | `/unban` | Yasağı kaldır |
| Moderasyon | `/sil` | Mesajları sil |
| Moderasyon | `/uyar` | Uyarı ver |
| Ticket | `/ticketkur` | Ticket sistemi kur |
| Ticket | `/ticketkapat` | Ticket kapat |
| Çekiliş | `/cekilis` | Çekiliş başlat |
| Çekiliş | `/cekilisdurdur` | Çekilişi durdur |
| Rol | `/rolver` | Rol ver |
| Rol | `/rolal` | Rol al |
| Rol | `/otomatikrol` | Otomatik rol ayarla |
| Bilgi | `/kullanicibilgi` | Kullanıcı bilgisi |
| Bilgi | `/avatar` | Avatar göster |
| Bilgi | `/sunucubilgi` | Sunucu bilgisi |
| Diğer | `/anket` | Anket oluştur |
| Diğer | `/duyuru` | Duyuru yap |
| Eğlence | `/espri` | Espri söyle |
| Eğlence | `/zar` | Zar at |
| Eğlence | `/sorusor` | Soru sor |
| Eğlence | `/yazitura` | Yazı tura |

## 🔐 İzin Sistemi

Her komutun kendi izin gereksinimi vardır:
- **Admin**: `/ticketkur`, `/otomatikrol`, `/duyuru`
- **Kick/Ban/Mute**: Moderasyon komutları
- **Manage Messages**: `/sil`, çekiliş komutları
- **Manage Roles**: `/rolver`, `/rolal`

## 🐛 Hata Çözümleri

### "Komutlar görünmüyor!"
- `npm run deploy-guild` çalıştır
- Botu sunucudan atıp yeniden ekle (invite link'te `applications.commands` olmalı)

### "Bot çevrimdışı görünüyor!"
- Token doğru mu kontrol et
- Intents'ler açık mı kontrol et

### "Mesajları silmiyor!"
- 14 günden eski mesajlar silinemez
- Botun "Manage Messages" izni olmalı

## 📞 Destek

Sorun yaşarsan:
1. Konsoldaki hata mesajını kontrol et
2. BOT_TOKEN doğru mu kontrol et
3. Intents'ler açık mı kontrol et

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**DonutBot** - Yapımcı: DonutSMP 🍩
