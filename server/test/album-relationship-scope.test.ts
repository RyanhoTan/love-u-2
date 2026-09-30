import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { describe, it } from "node:test";
import { createAlbumScope } from "../src/media/albumScope.js";

const currentRelationship = { id: 20, user_a_id: 1, user_b_id: 3 };

function withFixture(run: (database: DatabaseSync) => void) {
  const database = new DatabaseSync(":memory:");
  try {
    database.exec(`
      CREATE TABLE couple_relationships (
        id INTEGER PRIMARY KEY,
        user_a_id INTEGER,
        user_b_id INTEGER,
        status TEXT
      );
      INSERT INTO couple_relationships VALUES
        (10, 1, 2, 'unbound'), (20, 1, 3, 'bound'), (30, 4, 5, 'bound');

      CREATE TABLE album_media (
        id INTEGER PRIMARY KEY, relationship_id INTEGER, created_by_user_id INTEGER
      );
      INSERT INTO album_media VALUES
        (1, 20, 1), (2, 20, 3), (3, 10, 1), (4, 10, 2),
        (5, 30, 4), (6, NULL, 1), (7, NULL, 3), (8, NULL, 2);

      CREATE TABLE album_stories (
        id INTEGER PRIMARY KEY, relationship_id INTEGER, created_by_user_id INTEGER,
        is_favorite INTEGER DEFAULT 0
      );
      INSERT INTO album_stories (id, relationship_id, created_by_user_id)
        SELECT id, relationship_id, created_by_user_id FROM album_media;

      CREATE TABLE wishes (id INTEGER PRIMARY KEY, relationship_id INTEGER);
      CREATE TABLE wish_records (
        id INTEGER PRIMARY KEY, wish_id INTEGER, created_by_user_id INTEGER
      );
      INSERT INTO wishes SELECT id, relationship_id FROM album_media;
      INSERT INTO wish_records SELECT id, id, created_by_user_id FROM album_media;
    `);
    run(database);
  } finally {
    database.close();
  }
}

type Scope = ReturnType<typeof createAlbumScope>;

function readIds(
  database: DatabaseSync,
  scope: Scope,
  target: keyof Omit<Scope, "relationshipId">,
) {
  const sources = {
    media: "album_media",
    stories: "album_stories s",
    legacyWishRecords: "wish_records wr INNER JOIN wishes w ON w.id = wr.wish_id",
  };
  const idColumns = { media: "id", stories: "s.id", legacyWishRecords: "wr.id" };
  const predicate = scope[target];
  return database
    .prepare(`
      SELECT ${idColumns[target]} AS id FROM ${sources[target]}
      WHERE ${predicate.sql} ORDER BY ${idColumns[target]}
    `)
    .all(...predicate.values)
    .map((row) => row.id);
}

function assertAllSources(database: DatabaseSync, scope: Scope, expected: number[]) {
  for (const source of ["media", "stories", "legacyWishRecords"] as const) {
    assert.deepEqual(readIds(database, scope, source), expected, source);
  }
}

describe("album relationship SQL scope", () => {
  it("lets both current partners read their relation and unassigned legacy rows, not old or other relations", () => {
    withFixture((database) => {
      for (const userId of [1, 3]) {
        assertAllSources(
          database,
          createAlbumScope(userId, currentRelationship),
          [1, 2, 6, 7],
        );
      }
    });
  });

  it("denies an outsider or a missing relationship even if supplied a previously selected scope", () => {
    withFixture((database) => {
      assertAllSources(database, createAlbumScope(4, currentRelationship), []);
      assertAllSources(database, createAlbumScope(1, { id: 99 }), []);
    });
  });

  it("uses executing membership rather than a cached partner for NULL-row sharing", () => {
    withFixture((database) => {
      const scope = createAlbumScope(1, currentRelationship);
      database.exec("UPDATE couple_relationships SET user_b_id = 6 WHERE id = 20");
      assertAllSources(database, scope, [1, 2, 6]);
      database.exec("INSERT INTO album_media VALUES (9, NULL, 6)");
      assert.deepEqual(readIds(database, scope, "media"), [1, 2, 6, 9]);
    });
  });

  it("revokes previously built read and signing predicates after unbind or membership removal", () => {
    for (const mutation of [
      "UPDATE couple_relationships SET status = 'unbound' WHERE id = 20",
      "UPDATE couple_relationships SET user_a_id = 6 WHERE id = 20",
    ]) {
      withFixture((database) => {
        const scope = createAlbumScope(1, currentRelationship);
        database.exec(mutation);
        assertAllSources(database, scope, []);
      });
    }
  });

  it("preserves unbound owner behavior without exposing another creator's rows", () => {
    withFixture((database) => {
      assertAllSources(database, createAlbumScope(2, null), [4, 8]);
    });
  });

  it("invalidates an unbound scope once the owner binds", () => {
    withFixture((database) => {
      const scope = createAlbumScope(2, null);
      database.exec("INSERT INTO couple_relationships VALUES (40, 2, 6, 'bound')");
      assertAllSources(database, scope, []);
      const result = database.prepare(`
        UPDATE album_stories AS s SET is_favorite = 1
        WHERE s.id = ? AND ${scope.stories.sql}
      `).run(4, ...scope.stories.values);
      assert.equal(result.changes, 0);
    });
  });

  it("allows a current favorite write but leaves old/foreign and revoked stories untouched", () => {
    withFixture((database) => {
      const scope = createAlbumScope(1, currentRelationship);
      const statement = database.prepare(`
        UPDATE album_stories AS s SET is_favorite = 1
        WHERE s.id = ? AND ${scope.stories.sql}
      `);
      assert.equal(statement.run(1, ...scope.stories.values).changes, 1);
      for (const id of [3, 4, 5, 8]) {
        assert.equal(statement.run(id, ...scope.stories.values).changes, 0);
      }
      database.exec(
        "UPDATE couple_relationships SET status = 'unbound' WHERE id = 20",
      );
      assert.equal(statement.run(2, ...scope.stories.values).changes, 0);
      assert.equal(statement.run(6, ...scope.stories.values).changes, 0);
      assert.deepEqual(
        database
          .prepare("SELECT id FROM album_stories WHERE is_favorite = 1")
          .all()
          .map((row) => row.id),
        [1],
      );
    });
  });
});
