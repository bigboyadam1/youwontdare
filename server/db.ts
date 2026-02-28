import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, 'dares.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK(type IN ('personal', 'group')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_public INTEGER DEFAULT 1,
    invite_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS board_members (
    board_id INTEGER NOT NULL REFERENCES boards(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role TEXT NOT NULL DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (board_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS dares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    location TEXT,
    reward TEXT,
    hypes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    proof_url TEXT,
    proof_caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    board_id INTEGER REFERENCES boards(id),
    darer_id INTEGER REFERENCES users(id),
    dared_id INTEGER REFERENCES users(id)
  );
`);

// --- Migration: rename 'trip' board type to 'group' ---
db.exec("UPDATE boards SET type = 'group' WHERE type = 'trip'");

// --- Migration: add columns to existing dares table if missing ---
const columns = db.prepare("PRAGMA table_info(dares)").all() as { name: string }[];
const colNames = new Set(columns.map(c => c.name));

if (!colNames.has('board_id')) {
  db.exec('ALTER TABLE dares ADD COLUMN board_id INTEGER REFERENCES boards(id)');
}
if (!colNames.has('darer_id')) {
  db.exec('ALTER TABLE dares ADD COLUMN darer_id INTEGER REFERENCES users(id)');
}
if (!colNames.has('dared_id')) {
  db.exec('ALTER TABLE dares ADD COLUMN dared_id INTEGER REFERENCES users(id)');
}

// --- Migration: add google_id to users table ---
const userColumns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
const userColNames = new Set(userColumns.map(c => c.name));

if (!userColNames.has('google_id')) {
  db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
}

// --- Phase 3: Timer Dares ---
if (!colNames.has('deadline')) {
  db.exec('ALTER TABLE dares ADD COLUMN deadline DATETIME');
}

// --- Phase 6: Anonymous Dares ---
if (!colNames.has('is_anonymous')) {
  db.exec('ALTER TABLE dares ADD COLUMN is_anonymous INTEGER DEFAULT 0');
}
if (!colNames.has('revealed')) {
  db.exec('ALTER TABLE dares ADD COLUMN revealed INTEGER DEFAULT 0');
}

// --- Phase 2: Reactions + Spice Votes ---
db.exec(`
  CREATE TABLE IF NOT EXISTS dare_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dare_id INTEGER NOT NULL REFERENCES dares(id),
    user_id INTEGER,
    anon_id TEXT,
    reaction_type TEXT NOT NULL CHECK(reaction_type IN ('fire', 'skull', 'crying')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dare_id, user_id, reaction_type),
    UNIQUE(dare_id, anon_id, reaction_type)
  );

  CREATE TABLE IF NOT EXISTS spice_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dare_id INTEGER NOT NULL REFERENCES dares(id),
    user_id INTEGER,
    anon_id TEXT,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dare_id, user_id),
    UNIQUE(dare_id, anon_id)
  );
`);

// --- Phase 7: Push Subscriptions ---
db.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    endpoint TEXT NOT NULL UNIQUE,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
