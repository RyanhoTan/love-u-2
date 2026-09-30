export interface AlbumRelationship {
  id: number;
}

interface SqlPredicate {
  sql: string;
  values: number[];
}

export function createAlbumScope(
  userId: number,
  relationship: AlbumRelationship | null,
) {
  function predicate(
    relationshipColumn: string,
    creatorColumn: string,
  ): SqlPredicate {
    if (relationship) {
      // Resolve membership at query execution; a creator cannot override an
      // explicitly assigned relationship ID. NULL rows keep legacy sharing.
      return {
        sql: `EXISTS (
          SELECT 1
          FROM couple_relationships AS authorized_album_relationship
          WHERE authorized_album_relationship.id = ?
            AND authorized_album_relationship.status = 'bound'
            AND (
              authorized_album_relationship.user_a_id = ?
              OR authorized_album_relationship.user_b_id = ?
            )
            AND (
              ${relationshipColumn} = authorized_album_relationship.id
              OR (
                ${relationshipColumn} IS NULL
                AND ${creatorColumn} IN (
                  authorized_album_relationship.user_a_id,
                  authorized_album_relationship.user_b_id
                )
              )
            )
        )`,
        values: [relationship.id, userId, userId],
      };
    }

    return {
      sql: `(${creatorColumn} = ? AND NOT EXISTS (
        SELECT 1
        FROM couple_relationships AS active_album_relationship
        WHERE active_album_relationship.status = 'bound'
          AND (
            active_album_relationship.user_a_id = ?
            OR active_album_relationship.user_b_id = ?
          )
      ))`,
      values: [userId, userId, userId],
    };
  }

  return {
    relationshipId: relationship?.id ?? null,
    media: predicate("relationship_id", "created_by_user_id"),
    stories: predicate("s.relationship_id", "s.created_by_user_id"),
    legacyWishRecords: predicate("w.relationship_id", "wr.created_by_user_id"),
  };
}
