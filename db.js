const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/web3learn.db';

// Make sure the folder for the db file exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS payments (
  id           TEXT PRIMARY KEY,      -- access code, e.g. W3L-A1B2C3D4
  username     TEXT,
  telegram_id  TEXT NOT NULL,
  email        TEXT,
  course       TEXT NOT NULL,
  amount       REAL,
  access_code  TEXT UNIQUE NOT NULL,
  tx_hash      TEXT UNIQUE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | verified | active | rejected
  paid_at      TEXT,
  verified_at  TEXT,
  activated_at TEXT,
  rejected_at  TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT,
  email        TEXT,
  phone        TEXT,
  telegram_id  TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id      TEXT NOT NULL,
  direction    TEXT NOT NULL, -- 'in' | 'out'
  text         TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS state (
  key   TEXT PRIMARY KEY,
  value TEXT
);
`);

// ---------- state (last_update_id) ----------
function getState(key) {
  const row = db.prepare('SELECT value FROM state WHERE key = ?').get(key);
  return row ? row.value : null;
}
function setState(key, value) {
  db.prepare(`
    INSERT INTO state (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

// ---------- payments ----------
function findPaymentByTxHash(txHash) {
  return db.prepare('SELECT * FROM payments WHERE tx_hash = ?').get(txHash);
}
function findPaymentByCode(code) {
  return db.prepare('SELECT * FROM payments WHERE access_code = ?').get(code);
}
function insertPayment(p) {
  db.prepare(`
    INSERT INTO payments
      (id, username, telegram_id, email, course, amount, access_code, tx_hash, status, paid_at, created_at)
    VALUES
      (@id, @username, @telegram_id, @email, @course, @amount, @access_code, @tx_hash, 'pending', @now, @now)
  `).run(p);
}
function setPaymentStatus(code, status, timestampField) {
  db.prepare(`
    UPDATE payments SET status = ?, ${timestampField} = ? WHERE access_code = ?
  `).run(status, new Date().toISOString(), code);
}
function listPending() {
  return db.prepare(`SELECT * FROM payments WHERE status = 'pending' ORDER BY created_at DESC`).all();
}
function statsByStatus() {
  return db.prepare(`SELECT status, COUNT(*) as count FROM payments GROUP BY status`).all();
}
function deletePayment(code) {
  return db.prepare('DELETE FROM payments WHERE access_code = ?').run(code);
}

// ---------- leads ----------
function insertLead(lead) {
  db.prepare(`
    INSERT INTO leads (name, email, phone, telegram_id, created_at)
    VALUES (@name, @email, @phone, @telegram_id, @now)
  `).run(lead);
}

// ---------- conversations ----------
function logConversation(chatId, direction, text) {
  db.prepare(`
    INSERT INTO conversations (chat_id, direction, text, created_at)
    VALUES (?, ?, ?, ?)
  `).run(String(chatId), direction, text, new Date().toISOString());
}

module.exports = {
  db,
  getState,
  setState,
  findPaymentByTxHash,
  findPaymentByCode,
  insertPayment,
  setPaymentStatus,
  listPending,
  statsByStatus,
  deletePayment,
  insertLead,
  logConversation,
};
