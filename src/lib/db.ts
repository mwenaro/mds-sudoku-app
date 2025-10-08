// Database layer using better-sqlite3 (completed in Stage 3)
import fs from "node:fs";
import path from "node:path";

let Database: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Database = require("better-sqlite3");
} catch (e) {
  // Native module not available (e.g., no build tools) – we'll fall back to memory store
  Database = null;
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
        run: (name: string, difficulty: string, time_seconds: number, mistakes: number) => {
          if (!isInsert) throw new Error("Unsupported mutation in memory DB");
          const row: RecordRow = {
            id: memoryId++,
            name,
            difficulty,
            time_seconds,
            mistakes,
            created_at: new Date().toISOString(),
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
  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      time_seconds INTEGER NOT NULL,
      mistakes INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export const isMemoryDb = !Database;
export default db;
