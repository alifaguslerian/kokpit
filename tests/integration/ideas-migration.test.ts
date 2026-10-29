import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

test('Ideas migration preserves legacy thoughts, tags and pins with new constraints and collection SET NULL', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  for (const file of [
    '0000_overjoyed_warpath.sql',
    '0001_sloppy_phil_sheldon.sql',
    '0002_closed_mister_sinister.sql',
  ])
    db.exec(readFileSync('drizzle/migrations/' + file, 'utf8'));
  db.exec(`INSERT INTO users VALUES ('owner', 'owner@example.com', 'Owner', 'owner', 't', 't');
    INSERT INTO ideas VALUES ('old', 'owner', 'Kept', 'Legacy text', 1, 't', 't');
    INSERT INTO idea_tags VALUES ('tag', 'owner', 'Idea', 't');
    INSERT INTO idea_tag_links VALUES ('old', 'tag');`);
  db.exec(readFileSync('drizzle/migrations/0003_spicy_odin.sql', 'utf8'));
  const row = db.prepare('SELECT * FROM ideas WHERE id = ?').get('old');
  assert.equal(row!.content, 'Legacy text');
  assert.equal(row!.is_pinned, 1);
  assert.equal(row!.is_favorite, 0);
  assert.equal(row!.collection_id, null);
  assert.equal(row!.cover_r2_key, null);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM idea_tag_links').get()!.count, 1);
  assert.throws(() => db.exec("UPDATE ideas SET is_favorite = 2 WHERE id = 'old'"));
  assert.throws(() => db.exec("UPDATE ideas SET cover_r2_key = 'key' WHERE id = 'old'"));
  assert.throws(() =>
    db.exec("UPDATE ideas SET cover_r2_key = 'key', cover_size_bytes = 2 WHERE id = 'old'"),
  );
  assert.throws(() => db.exec("UPDATE ideas SET collection_id = 'missing' WHERE id = 'old'"));
  db.exec(
    "INSERT INTO idea_collections VALUES ('collection', 'owner', 'Personal', 'personal', 0, 't', 't')",
  );
  db.exec("UPDATE ideas SET collection_id = 'collection', is_favorite = 1 WHERE id = 'old'");
  db.exec("DELETE FROM idea_collections WHERE id = 'collection'");
  assert.equal(
    db.prepare("SELECT collection_id FROM ideas WHERE id = 'old'").get()!.collection_id,
    null,
  );
  assert.equal(db.prepare("SELECT is_favorite FROM ideas WHERE id = 'old'").get()!.is_favorite, 1);
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  db.close();
});
