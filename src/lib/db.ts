// Database layer using better-sqlite3 (completed in Stage 3)
import fs from "node:fs";
import path from "node:path";

let Database: any = null;
if (typeof window === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Database = require("better-sqlite3");
  } catch (e) {
    // Native module not available – fall back to memory store
    Database = null;
  }
}

const root = process.cwd();
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "sudoku.db");

if (Database) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

type RecordRow = {
  id: number;
  name: string;
  difficulty: string;
  time_seconds: number;
  mistakes: number;
  created_at: string;
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
};

let memoryRows: RecordRow[] = [];
let memoryId = 1;

function createMemoryDb() {
  return {
    exec: (_sql: string) => {},
    prepare: (sql: string) => {
      const isSelect = /select\s+.+from\s+records/i.test(sql);
      const isInsert = /insert\s+into\s+records/i.test(sql);
      return {
        all: () => {
          if (!isSelect) throw new Error("Unsupported query in memory DB");
          return [...memoryRows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 100);
        },
        run: (name: string, difficulty: string, time_seconds: number, mistakes: number, user_id?: string, user_name?: string, user_email?: string) => {
          if (!isInsert) throw new Error("Unsupported mutation in memory DB");
          const row: RecordRow = {
            id: memoryId++,
            name,
            difficulty,
            time_seconds,
            mistakes,
            created_at: new Date().toISOString(),
            user_id: user_id || null,
            user_name: user_name || null,
            user_email: user_email || null,
          };
          memoryRows.push(row);
          return { lastInsertRowid: row.id };
        },
      };
    },
  } as const;
}

export const db = Database ? new Database(dbPath) : createMemoryDb();

if (Database) {
  // Create table if not exists, add user fields if missing
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      time_seconds INTEGER NOT NULL,
      mistakes INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT,
      user_name TEXT,
      user_email TEXT
    );
  `);
  // Try to add columns if upgrading from old schema
  try { db.exec('ALTER TABLE records ADD COLUMN user_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE records ADD COLUMN user_name TEXT;'); } catch {}
  try { db.exec('ALTER TABLE records ADD COLUMN user_email TEXT;'); } catch {}
}

export const isMemoryDb = !Database;
export default db;
