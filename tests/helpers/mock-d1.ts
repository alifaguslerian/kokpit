import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

export function createTestD1(seedUserId = 'user-owner-1'): D1Database {
  const db = new DatabaseSync(':memory:');
  const migrationPath = path.resolve(
    process.cwd(),
    'drizzle/migrations/0000_overjoyed_warpath.sql',
  );
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  db.exec(migrationSql);

  // Insert seed owner
  db.exec(
    `INSERT INTO users (id, email, display_name, role, created_at, updated_at) VALUES ('${seedUserId}', 'owner@example.com', 'Owner', 'owner', datetime('now'), datetime('now'))`,
  );

  function createStatement(query: string, boundParams: unknown[] = []): unknown {
    return {
      bind(...params: unknown[]) {
        return createStatement(query, params);
      },
      async all() {
        const stmt = db.prepare(query);
        const results = stmt.all(...(boundParams as []));
        return { results, success: true, meta: { changes: 0 } };
      },
      async first(colName?: string) {
        const stmt = db.prepare(query);
        const row = stmt.get(...(boundParams as [])) as Record<string, unknown> | undefined;
        if (!row) return null;
        if (colName) return row[colName];
        return row;
      },
      async run() {
        const stmt = db.prepare(query);
        const result = stmt.run(...(boundParams as []));
        return {
          success: true,
          meta: { changes: result.changes, last_row_id: Number(result.lastInsertRowid) },
        };
      },
      async raw() {
        const stmt = db.prepare(query);
        const rows = stmt.all(...(boundParams as [])) as Array<Record<string, unknown>>;
        return rows.map((r) => Object.values(r));
      },
    };
  }

  return {
    prepare(query: string) {
      return createStatement(query);
    },
    async batch(statements: Array<{ all: () => Promise<unknown> }>) {
      const results = [];
      for (const s of statements) {
        results.push(await s.all());
      }
      return results;
    },
    async exec(query: string) {
      db.exec(query);
      return { count: 1, duration: 0 };
    },
    dump: async () => new ArrayBuffer(0),
  } as unknown as D1Database;
}
