import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";

type DbValue = string | number | null;

type DbExecutor = {
  all<T>(query: string, params?: DbValue[]): Promise<T[]>;
  get<T>(query: string, params?: DbValue[]): Promise<T | undefined>;
  run(query: string, params?: DbValue[]): Promise<void>;
};

declare global {
  // eslint-disable-next-line no-var
  var sqliteDb: DatabaseSync | undefined;
  // eslint-disable-next-line no-var
  var postgresDb: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var dbSchemaPromise: Promise<void> | undefined;
}

const schemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )
  `,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone")`,
  `
    CREATE TABLE IF NOT EXISTS "Event" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "eventDate" TEXT NOT NULL,
      "startTime" TEXT NOT NULL,
      "endTime" TEXT NOT NULL,
      "venueName" TEXT NOT NULL,
      "venueAddress" TEXT NOT NULL,
      "capacity" INTEGER NOT NULL,
      "signupDeadline" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'OPEN',
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )
  `,
  `CREATE INDEX IF NOT EXISTS "Event_eventDate_status_idx" ON "Event"("eventDate", "status")`,
  `
    CREATE TABLE IF NOT EXISTS "Registration" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "eventId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
      "createdAt" TEXT NOT NULL,
      "canceledAt" TEXT,
      "waitlistPosition" INTEGER,
      FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Registration_eventId_userId_key" ON "Registration"("eventId", "userId")`,
  `CREATE INDEX IF NOT EXISTS "Registration_eventId_status_waitlistPosition_idx" ON "Registration"("eventId", "status", "waitlistPosition")`,
  `CREATE INDEX IF NOT EXISTS "Registration_userId_status_idx" ON "Registration"("userId", "status")`,
  `
    CREATE TABLE IF NOT EXISTS "Notice" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "eventId" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL,
      FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Notice_eventId_key" ON "Notice"("eventId")`
] as const;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || "file:./dev.db";
}

function isPostgresUrl(url = getDatabaseUrl()) {
  return /^postgres(ql)?:\/\//i.test(url);
}

function resolveSqlitePath(url = getDatabaseUrl()) {
  if (!url.startsWith("file:")) {
    throw new Error("本地环境请使用 SQLite file: 数据库地址");
  }

  const rawPath = decodeURIComponent(url.slice(5));
  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }

  return path.resolve(process.cwd(), "prisma", rawPath);
}

function getSqliteDb() {
  if (!global.sqliteDb) {
    const dbPath = resolveSqlitePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    global.sqliteDb = new DatabaseSync(dbPath);
    global.sqliteDb.exec("PRAGMA foreign_keys = ON");
  }

  return global.sqliteDb;
}

function getPostgresDb() {
  if (!global.postgresDb) {
    global.postgresDb = postgres(getDatabaseUrl(), {
      ssl: "require",
      max: 1,
      prepare: false
    });
  }

  return global.postgresDb;
}

function toPostgresQuery(query: string) {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

async function ensureSchema() {
  if (!global.dbSchemaPromise) {
    global.dbSchemaPromise = (async () => {
      if (isPostgresUrl()) {
        const sql = getPostgresDb();
        for (const statement of schemaStatements) {
          await sql.unsafe(statement);
        }
      } else {
        const db = getSqliteDb();
        for (const statement of schemaStatements) {
          db.exec(statement);
        }
      }
    })();
  }

  await global.dbSchemaPromise;
}

function createSqliteExecutor(db: DatabaseSync): DbExecutor {
  return {
    async all<T>(query: string, params: DbValue[] = []) {
      return db.prepare(query).all(...params) as T[];
    },
    async get<T>(query: string, params: DbValue[] = []) {
      return db.prepare(query).get(...params) as T | undefined;
    },
    async run(query: string, params: DbValue[] = []) {
      db.prepare(query).run(...params);
    }
  };
}

function createPostgresExecutor(sql: { unsafe: ReturnType<typeof postgres>["unsafe"] }): DbExecutor {
  return {
    async all<T>(query: string, params: DbValue[] = []) {
      return (await sql.unsafe(toPostgresQuery(query), params)) as T[];
    },
    async get<T>(query: string, params: DbValue[] = []) {
      const rows = (await sql.unsafe(toPostgresQuery(query), params)) as T[];
      return rows[0];
    },
    async run(query: string, params: DbValue[] = []) {
      await sql.unsafe(toPostgresQuery(query), params);
    }
  };
}

async function getExecutor() {
  await ensureSchema();
  return isPostgresUrl() ? createPostgresExecutor(getPostgresDb()) : createSqliteExecutor(getSqliteDb());
}

export async function dbAll<T>(query: string, params: DbValue[] = []) {
  const db = await getExecutor();
  return db.all<T>(query, params);
}

export async function dbGet<T>(query: string, params: DbValue[] = []) {
  const db = await getExecutor();
  return db.get<T>(query, params);
}

export async function dbRun(query: string, params: DbValue[] = []) {
  const db = await getExecutor();
  await db.run(query, params);
}

export async function transaction<T>(fn: (db: DbExecutor) => Promise<T>) {
  await ensureSchema();

  if (isPostgresUrl()) {
    const sql = getPostgresDb();
    return sql.begin(async (tx) => {
      const db = createPostgresExecutor(tx);
      return fn(db);
    });
  }

  const sqlite = getSqliteDb();
  const db = createSqliteExecutor(sqlite);
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    const result = await fn(db);
    sqlite.exec("COMMIT");
    return result;
  } catch (error) {
    sqlite.exec("ROLLBACK");
    throw error;
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId() {
  return randomUUID();
}

export async function resetAllTables() {
  await transaction(async (db) => {
    await db.run(`DELETE FROM "Notice"`);
    await db.run(`DELETE FROM "Registration"`);
    await db.run(`DELETE FROM "Event"`);
    await db.run(`DELETE FROM "User"`);
  });
}
