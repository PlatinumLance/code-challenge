import Database from "better-sqlite3";
import path from "node:path";

// Connect to SQLite
const db = new Database(path.resolve(__dirname, '../../database.db'))

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )
`).run();

export default db;