const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Hesap bağlama tablosu
  db.run(`CREATE TABLE IF NOT EXISTS linked_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    minecraft_uuid TEXT UNIQUE,
    minecraft_username TEXT,
    discord_id TEXT UNIQUE,
    discord_username TEXT,
    link_code TEXT UNIQUE,
    link_code_expires INTEGER,
    linked_at INTEGER,
    is_linked BOOLEAN DEFAULT 0
  )`);

  // Link kodları tablosu (geçici)
  db.run(`CREATE TABLE IF NOT EXISTS link_codes (
    code TEXT PRIMARY KEY,
    minecraft_uuid TEXT,
    minecraft_username TEXT,
    expires_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
});

class Database {
  // Yeni link kodu oluştur
  static createLinkCode(minecraftUUID, minecraftUsername) {
    return new Promise((resolve, reject) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 haneli kod
      const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10 dakika geçerli

      db.run(
        `INSERT INTO link_codes (code, minecraft_uuid, minecraft_username, expires_at) 
         VALUES (?, ?, ?, ?)`,
        [code, minecraftUUID, minecraftUsername, expiresAt],
        function(err) {
          if (err) reject(err);
          else resolve({ code, expiresAt });
        }
      );
    });
  }

  // Kod doğrula ve bağla
  static verifyLinkCode(code, discordId, discordUsername) {
    return new Promise((resolve, reject) => {
      const now = Math.floor(Date.now() / 1000);

      db.get(
        `SELECT * FROM link_codes WHERE code = ? AND expires_at > ?`,
        [code.toUpperCase(), now],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve({ success: false, error: 'Kod geçersiz veya süresi dolmuş' });

          // Hesapları bağla
          db.run(
            `INSERT OR REPLACE INTO linked_accounts 
             (minecraft_uuid, minecraft_username, discord_id, discord_username, linked_at, is_linked) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [row.minecraft_uuid, row.minecraft_username, discordId, discordUsername, now],
            function(err) {
              if (err) return reject(err);
              
              // Kodu sil
              db.run(`DELETE FROM link_codes WHERE code = ?`, [code.toUpperCase()]);
              
              resolve({ 
                success: true, 
                minecraftUUID: row.minecraft_uuid,
                minecraftUsername: row.minecraft_username 
              });
            }
          );
        }
      );
    });
  }

  // Bağlı hesabı getir (Discord ID ile)
  static getLinkedAccountByDiscord(discordId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM linked_accounts WHERE discord_id = ? AND is_linked = 1`,
        [discordId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Bağlı hesabı getir (Minecraft UUID ile)
  static getLinkedAccountByMinecraft(minecraftUUID) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM linked_accounts WHERE minecraft_uuid = ? AND is_linked = 1`,
        [minecraftUUID],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Bağlantıyı kaldır
  static unlinkAccount(discordId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE linked_accounts SET is_linked = 0 WHERE discord_id = ?`,
        [discordId],
        function(err) {
          if (err) reject(err);
          else resolve({ success: true, changes: this.changes });
        }
      );
    });
  }

  // Tüm bağlı hesapları listele
  static getAllLinkedAccounts() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM linked_accounts WHERE is_linked = 1 ORDER BY linked_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Eski kodları temizle
  static cleanupExpiredCodes() {
    const now = Math.floor(Date.now() / 1000);
    db.run(`DELETE FROM link_codes WHERE expires_at < ?`, [now]);
  }
}

// Her saat eski kodları temizle
setInterval(() => Database.cleanupExpiredCodes(), 60 * 60 * 1000);

module.exports = Database;
