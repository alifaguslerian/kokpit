import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

test('the additive schedule migration preserves existing hierarchy and material data and enforces class constraints', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys = ON');
    db.exec(readFileSync('drizzle/migrations/0000_overjoyed_warpath.sql', 'utf8'));
    db.exec(readFileSync('drizzle/migrations/0001_sloppy_phil_sheldon.sql', 'utf8'));
    db.exec(`INSERT INTO users VALUES ('owner', 'owner@example.com', 'Owner', 'owner', 'now', 'now');
      INSERT INTO semesters (id, user_id, name, position, created_at, updated_at) VALUES ('s', 'owner', 'Existing semester', 0, 'now', 'now');
      INSERT INTO courses (id, user_id, semester_id, name, position, created_at, updated_at) VALUES ('c', 'owner', 's', 'Existing course', 0, 'now', 'now');
      INSERT INTO weeks (id, user_id, course_id, week_number, created_at, updated_at) VALUES ('w', 'owner', 'c', 1, 'now', 'now');
      INSERT INTO materials (id, user_id, week_id, type, title, external_url, position, created_at, updated_at) VALUES ('m', 'owner', 'w', 'link', 'Existing reading', 'https://example.com', 0, 'now', 'now');`);
    db.exec(readFileSync('drizzle/migrations/0002_closed_mister_sinister.sql', 'utf8'));
    const course = db.prepare('SELECT name, description FROM courses WHERE id = ?').get('c');
    assert.deepEqual({ ...course }, { name: 'Existing course', description: null });
    assert.equal(
      db.prepare('SELECT title FROM materials WHERE id = ?').get('m')?.title,
      'Existing reading',
    );
    const insert = db.prepare(
      "INSERT INTO course_schedule_entries VALUES (?, 'owner', 'c', ?, ?, ?, NULL, 'now', 'now')",
    );
    insert.run('valid', 7, 0, 1440);
    for (const [day, start, end] of [
      [0, 0, 60],
      [8, 0, 60],
      [1, -1, 60],
      [1, 60, 60],
      [1, 90, 60],
      [1, 0, 1441],
    ])
      assert.throws(
        () => insert.run(`bad-${day}-${start}-${end}`, day!, start!, end!),
        /CHECK constraint/,
      );
    assert.throws(() => insert.run('duplicate', 7, 0, 1440), /UNIQUE constraint/);
    assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
    db.exec("DELETE FROM courses WHERE id = 'c'");
    assert.equal(
      db.prepare('SELECT COUNT(*) AS total FROM course_schedule_entries').get()?.total,
      0,
    );
  } finally {
    db.close();
  }
});
