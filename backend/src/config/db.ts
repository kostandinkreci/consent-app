import Database from 'better-sqlite3';

const db = new Database('consent.db');

db.pragma('journal_mode = WAL');

const createTables = () => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      walletAddress TEXT NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS CONSENTS (
      id TEXT PRIMARY KEY,
      initiatorId INTEGER NOT NULL,
      partnerId INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      validFrom TEXT,
      validTo TEXT,
      status TEXT NOT NULL,
      blockchainId TEXT,
      txHash TEXT,
      joinCode TEXT,
      initiatorConfirmed INTEGER DEFAULT 0,
      partnerConfirmed INTEGER DEFAULT 0,
      FOREIGN KEY (initiatorId) REFERENCES USERS(id),
      FOREIGN KEY (partnerId) REFERENCES USERS(id)
    )
  `).run();
};

createTables();

export default db;
