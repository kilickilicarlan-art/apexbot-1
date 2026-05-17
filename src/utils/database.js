const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath);

// Hesap bağlama tablosu
db.exec(`CREATE TABLE IF NOT EXISTS linked_accounts (
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
db.exec(`CREATE TABLE IF NOT EXISTS link_codes (
  code TEXT PRIMARY KEY,
  minecraft_uuid TEXT,
  minecraft_username TEXT,
  expires_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
)`);

class Database {
  // Yeni link kodu oluştur
  static createLinkCode(minecraftUUID, minecraftUsername) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = Math.floor(Date.now() / 1000) + 600;

    const stmt = db.prepare(
      `INSERT INTO link_codes (code, minecraft_uuid, minecraft_username, expires_at) 
       VALUES (?, ?, ?, ?)`
    );
    stmt.run(code, minecraftUUID, minecraftUsername, expiresAt);
    
    return Promise.resolve({ code, expiresAt });
  }

  // Kod doğrula ve bağla
  static verifyLinkCode(code, discordId, discordUsername) {
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(
      `SELECT * FROM link_codes WHERE code = ? AND expires_at > ?`
    );
    const row = stmt.get(code.toUpperCase(), now);

    if (!row) {
      return Promise.resolve({ success: false, error: 'Kod geçersiz veya süresi dolmuş' });
    }

    // Hesapları bağla
    const linkStmt = db.prepare(
      `INSERT OR REPLACE INTO linked_accounts 
       (minecraft_uuid, minecraft_username, discord_id, discord_username, linked_at, is_linked) 
       VALUES (?, ?, ?, ?, ?, 1)`
    );
    linkStmt.run(row.minecraft_uuid, row.minecraft_username, discordId, discordUsername, now);

    // Kodu sil
    const deleteStmt = db.prepare(`DELETE FROM link_codes WHERE code = ?`);
    deleteStmt.run(code.toUpperCase());

    return Promise.resolve({ 
      success: true, 
      minecraftUUID: row.minecraft_uuid,
      minecraftUsername: row.minecraft_username 
    });
  }

  // Bağlı hesabı getir (Discord ID ile)
  static getLinkedAccountByDiscord(discordId) {
    const stmt = db.prepare(
      `SELECT * FROM linked_accounts WHERE discord_id = ? AND is_linked = 1`
    );
    const row = stmt.get(discordId);
    return Promise.resolve(row);
  }

  // Bağlı hesabı getir (Minecraft UUID ile)
  static getLinkedAccountByMinecraft(minecraftUUID) {
    const stmt = db.prepare(
      `SELECT * FROM linked_accounts WHERE minecraft_uuid = ? AND is_linked = 1`
    );
    const row = stmt.get(minecraftUUID);
    return Promise.resolve(row);
  }

  // Bağlantıyı kaldır
  static unlinkAccount(discordId) {
    const stmt = db.prepare(
      `UPDATE linked_accounts SET is_linked = 0 WHERE discord_id = ?`
    );
    const result = stmt.run(discordId);
    return Promise.resolve({ success: true, changes: result.changes });
  }

  // Tüm bağlı hesapları listele
  static getAllLinkedAccounts() {
    const stmt = db.prepare(
      `SELECT * FROM linked_accounts WHERE is_linked = 1 ORDER BY linked_at DESC`
    );
    const rows = stmt.all();
    return Promise.resolve(rows);
  }

  // Eski kodları temizle
  static cleanupExpiredCodes() {
    const now = Math.floor(Date.now() / 1000);
    const stmt = db.prepare(`DELETE FROM link_codes WHERE expires_at < ?`);
    stmt.run(now);
  }
}

// Her saat eski kodları temizle
setInterval(() => Database.cleanupExpiredCodes(), 60 * 60 * 1000);

module.exports = Database;
