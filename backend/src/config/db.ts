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
      createdAt TEXT,
      confirmedAt TEXT,
      FOREIGN KEY (initiatorId) REFERENCES USERS(id),
      FOREIGN KEY (partnerId) REFERENCES USERS(id)
    )
  `).run();
};

createTables();

const ensureConsentColumns = () => {
  const columns = db
    .prepare(`PRAGMA table_info('CONSENTS')`)
    .all()
    .map((column: { name: string }) => column.name);
  const columnSet = new Set(columns);

  if (!columnSet.has('createdAt')) {
    db.prepare('ALTER TABLE CONSENTS ADD COLUMN createdAt TEXT').run();
  }

  if (!columnSet.has('confirmedAt')) {
    db.prepare('ALTER TABLE CONSENTS ADD COLUMN confirmedAt TEXT').run();
  }
};

ensureConsentColumns();

export default db;
