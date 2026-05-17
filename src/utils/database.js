const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');

let db = null;

// Veritabanını yükle veya oluştur
function initDatabase() {
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    initSqlJs().then(SQL => {
      db = new SQL.Database(fileBuffer);
    });
  } else {
    initSqlJs().then(SQL => {
      db = new SQL.Database();
      createTables();
      saveDatabase();
    });
  }
}

// Tabloları oluştur
function createTables() {
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

  db.run(`CREATE TABLE IF NOT EXISTS link_codes (
    code TEXT PRIMARY KEY,
    minecraft_uuid TEXT,
    minecraft_username TEXT,
    expires_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`);
}

// Veritabanını kaydet
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

initDatabase();

class Database {
  // Yeni link kodu oluştur
  static createLinkCode(minecraftUUID, minecraftUsername) {
    if (!db) return Promise.reject('Database not initialized');
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = Math.floor(Date.now() / 1000) + 600;

    db.run(
      `INSERT INTO link_codes (code, minecraft_uuid, minecraft_username, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [code, minecraftUUID, minecraftUsername, expiresAt]
    );
    
    saveDatabase();
    return Promise.resolve({ code, expiresAt });
  }

  // Kod doğrula ve bağla
  static verifyLinkCode(code, discordId, discordUsername) {
    if (!db) return Promise.reject('Database not initialized');
    
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(
      `SELECT * FROM link_codes WHERE code = ? AND expires_at > ?`
    );
    const row = stmt.getAsObject([code.toUpperCase(), now]);

    if (!row) {
      return Promise.resolve({ success: false, error: 'Kod geçersiz veya süresi dolmuş' });
    }

    // Hesapları bağla
    db.run(
      `INSERT OR REPLACE INTO linked_accounts 
       (minecraft_uuid, minecraft_username, discord_id, discord_username, linked_at, is_linked) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [row.minecraft_uuid, row.minecraft_username, discordId, discordUsername, now]
    );

    // Kodu sil
    db.run(`DELETE FROM link_codes WHERE code = ?`, [code.toUpperCase()]);
    
    saveDatabase();
    return Promise.resolve({ 
      success: true, 
      minecraftUUID: row.minecraft_uuid,
      minecraftUsername: row.minecraft_username 
    });
  }

  // Bağlı hesabı getir (Discord ID ile)
  static getLinkedAccountByDiscord(discordId) {
    if (!db) return Promise.reject('Database not initialized');
    
    const stmt = db.prepare(
      `SELECT * FROM linked_accounts WHERE discord_id = ? AND is_linked = 1`
    );
    const row = stmt.getAsObject([discordId]);
    return Promise.resolve(row);
  }

  // Bağlı hesabı getir (Minecraft UUID ile)
  static getLinkedAccountByMinecraft(minecraftUUID) {
    if (!db) return Promise.reject('Database not initialized');
    
    const stmt = db.prepare(
      `SELECT * FROM linked_accounts WHERE minecraft_uuid = ? AND is_linked = 1`
    );
    const row = stmt.getAsObject([minecraftUUID]);
    return Promise.resolve(row);
  }

  // Bağlantıyı kaldır
  static unlinkAccount(discordId) {
    if (!db) return Promise.reject('Database not initialized');
    
    db.run(
      `UPDATE linked_accounts SET is_linked = 0 WHERE discord_id = ?`,
      [discordId]
    );
    
    saveDatabase();
    return Promise.resolve({ success: true });
  }

  // Tüm bağlı hesapları listele
  static getAllLinkedAccounts() {
    if (!db) return Promise.reject('Database not initialized');
    
    const stmt = db.prepare(
      `SELECT * FROM linked_accounts WHERE is_linked = 1 ORDER BY linked_at DESC`
    );
    const rows = stmt.getAsObject([]);
    return Promise.resolve(rows);
  }

  // Eski kodları temizle
  static cleanupExpiredCodes() {
    if (!db) return;
    
    const now = Math.floor(Date.now() / 1000);
    db.run(`DELETE FROM link_codes WHERE expires_at < ?`, [now]);
    saveDatabase();
  }
}

// Her saat eski kodları temizle
setInterval(() => Database.cleanupExpiredCodes(), 60 * 60 * 1000);

module.exports = Database;
