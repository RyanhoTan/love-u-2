import type { Request, Response } from "express";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { getAuthenticatedUserId } from "../auth.js";
import db from "../db/index.js";
import { HttpError } from "../errors.js";
import { createAlbumScope } from "../media/albumScope.js";
import { isAlbumObjectKeyOwnedByUser } from "../media/objectKey.js";
import {
  createAlbumMediaSchema,
  createAlbumStorySchema,
  updateAlbumStoryFavoriteSchema,
} from "../schema/album.js";
import { createMediaReadUrl } from "./upload.js";
import { parseRequestBody } from "../validation.js";

interface CoupleRelationshipRow extends RowDataPacket {
  id: number;
  user_a_id: number;
  user_b_id: number;
}

interface TableNameRow extends RowDataPacket {
  TABLE_NAME: string;
}

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

interface AlbumMediaRow extends RowDataPacket {
  id: number;
  relationship_id: number | null;
  created_by_user_id: number;
  media_type: "image" | "video";
  source_type: "wish_record" | "story" | "upload";
  source_id: number | null;
  object_key: string | null;
  url: string;
  thumbnail_url: string | null;
  taken_at: Date | string | null;
  location_name: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  created_at: Date | string;
}

interface LegacyWishRecordMediaRow extends RowDataPacket {
  id: number;
  relationship_id: number | null;
  created_by_user_id: number;
  media_urls: string[] | string | null;
  record_date: Date | string;
  created_at: Date | string;
}

interface SerializedAlbumMedia {
  id: number;
  relationshipId: number | null;
  createdByUserId: number;
  mediaType: "image" | "video";
  sourceType: "wish_record" | "story" | "upload";
  sourceId: number | null;
  url: string;
  thumbnailUrl: string;
  takenAt: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  uploadedAt: string;
  createdAt: string;
}

interface AlbumStoryRow extends RowDataPacket {
  id: number;
  relationship_id: number | null;
  created_by_user_id: number;
  title: string;
  description: string | null;
  cover_media_id: number | null;
  cover_url: string | null;
  cover_thumbnail_url: string | null;
  cover_object_key: string | null;
  cover_media_type: "image" | "video" | null;
  photo_count: number | string;
  video_count: number | string;
  is_favorite: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface SerializedAlbumStory {
  id: number;
  relationshipId: number | null;
  createdByUserId: number;
  title: string;
  description: string;
  coverMediaId: number | null;
  coverMediaType: "image" | "video" | null;
  coverUrl: string;
  coverThumbnailUrl: string;
  photos: number;
  videos: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDateOnly(value: Date | string | null) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(value: Date | string) {
  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  return value.toISOString();
}

async function serializeAlbumMedia(
  row: AlbumMediaRow,
): Promise<SerializedAlbumMedia> {
  const objectKey = row.object_key?.trim();

  return {
    id: row.id,
    relationshipId: row.relationship_id,
    createdByUserId: row.created_by_user_id,
    mediaType: row.media_type,
    sourceType: row.source_type,
    sourceId: row.source_id,
    url: objectKey ? await createMediaReadUrl(objectKey) : row.url,
    thumbnailUrl: objectKey ? "" : row.thumbnail_url || "",
    takenAt: formatDateOnly(row.taken_at),
    locationName: row.location_name || "",
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    uploadedAt: formatDateTime(row.created_at),
    createdAt: formatDateTime(row.created_at),
  };
}

async function serializeAlbumStory(
  row: AlbumStoryRow,
): Promise<SerializedAlbumStory> {
  const coverObjectKey = row.cover_object_key?.trim();

  return {
    id: row.id,
    relationshipId: row.relationship_id,
    createdByUserId: row.created_by_user_id,
    title: row.title,
    description: row.description || "",
    coverMediaId: row.cover_media_id,
    coverMediaType: row.cover_media_type,
    coverUrl: coverObjectKey
      ? await createMediaReadUrl(coverObjectKey)
      : row.cover_url || "",
    coverThumbnailUrl: coverObjectKey ? "" : row.cover_thumbnail_url || "",
    photos: Number(row.photo_count),
    videos: Number(row.video_count),
    isFavorite: Boolean(row.is_favorite),
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

function parseLegacyMediaUrls(row: LegacyWishRecordMediaRow) {
  if (!row.media_urls) {
    return [];
  }

  if (Array.isArray(row.media_urls)) {
    return row.media_urls.filter(
      (item): item is string => typeof item === "string",
    );
  }

  try {
    const parsed = JSON.parse(row.media_urls) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return [];
  }

  return [];
}

function inferMediaType(url: string): "image" | "video" {
  return /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(url) ? "video" : "image";
}

function assertObjectKeyBelongsToUser(userId: number, objectKey: string) {
  if (!isAlbumObjectKeyOwnedByUser(userId, objectKey)) {
    throw new HttpError(403, "media object does not belong to the current user");
  }
}

async function findActiveRelationshipByUserId(userId: number) {
  const [rows] = await db.query<CoupleRelationshipRow[]>(
    `
      SELECT id
        , user_a_id
        , user_b_id
      FROM couple_relationships
      WHERE status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)
      LIMIT 1
    `,
    [userId, userId],
  );

  return rows[0] ?? null;
}

async function hasTable(tableName: string) {
  const [rows] = await db.query<TableNameRow[]>(
    `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    [tableName],
  );

  return rows.length > 0;
}

async function hasColumn(tableName: string, columnName: string) {
  const [rows] = await db.query<ColumnNameRow[]>(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName],
  );

  return rows.length > 0;
}

async function ensureAlbumStoriesFavoriteColumn() {
  if (!(await hasColumn("album_stories", "is_favorite"))) {
    await db.query(
      `
        ALTER TABLE album_stories
        ADD COLUMN is_favorite TINYINT(1) NOT NULL DEFAULT 0
      `,
    );
  }
}

export async function buildAlbumScope(userId: number) {
  const relationship = await findActiveRelationshipByUserId(userId);
  return createAlbumScope(userId, relationship);
}

function storySelectSql() {
  return `
    SELECT
      s.id,
      s.relationship_id,
      s.created_by_user_id,
      s.title,
      s.description,
      s.cover_media_id,
      cover.url AS cover_url,
      cover.thumbnail_url AS cover_thumbnail_url,
      cover.object_key AS cover_object_key,
      cover.media_type AS cover_media_type,
      COALESCE(SUM(m.media_type = 'image'), 0) AS photo_count,
      COALESCE(SUM(m.media_type = 'video'), 0) AS video_count,
      s.is_favorite,
      s.created_at,
      s.updated_at
    FROM album_stories s
    LEFT JOIN album_media m
      ON m.source_type = 'story'
      AND m.source_id = s.id
      AND (
        m.relationship_id = s.relationship_id
        OR (
          m.relationship_id IS NULL
          AND m.created_by_user_id = s.created_by_user_id
        )
      )
    LEFT JOIN album_media cover
      ON cover.id = s.cover_media_id
      AND (
        cover.relationship_id = s.relationship_id
        OR (
          cover.relationship_id IS NULL
          AND cover.created_by_user_id = s.created_by_user_id
        )
      )
  `;
}

async function getStoryRows(
  scope: Awaited<ReturnType<typeof buildAlbumScope>>,
  options?: {
    storyId?: number;
    favoritesOnly?: boolean;
  },
) {
  const [rows] = await db.query<AlbumStoryRow[]>(
    `
      ${storySelectSql()}
      WHERE ${scope.stories.sql}
      ${options?.storyId ? "AND s.id = ?" : ""}
      ${options?.favoritesOnly ? "AND s.is_favorite = 1" : ""}
      GROUP BY
        s.id,
        s.relationship_id,
        s.created_by_user_id,
        s.title,
        s.description,
        s.cover_media_id,
        cover.url,
        cover.thumbnail_url,
        cover.object_key,
        cover.media_type,
        s.is_favorite,
        s.created_at,
        s.updated_at
      ORDER BY s.updated_at DESC, s.id DESC
    `,
    options?.storyId
      ? [...scope.stories.values, options.storyId]
      : scope.stories.values,
  );

  return rows;
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "invalid story id");
  }

  return id;
}

async function assertAlbumStoriesTableReady() {
  if (!(await hasTable("album_stories"))) {
    throw new HttpError(500, "album stories table not found");
  }

  await ensureAlbumStoriesFavoriteColumn();
}

export async function getAlbumMedia(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const scope = await buildAlbumScope(userId);
  const media: SerializedAlbumMedia[] = [];

  if (await hasTable("album_media")) {
    const [rows] = await db.query<AlbumMediaRow[]>(
      `
        SELECT
          id,
          relationship_id,
          created_by_user_id,
          media_type,
          source_type,
          source_id,
          object_key,
          url,
          thumbnail_url,
          taken_at,
          location_name,
          latitude,
          longitude,
          created_at
        FROM album_media
        WHERE ${scope.media.sql}
      `,
      scope.media.values,
    );

    media.push(...(await Promise.all(rows.map(serializeAlbumMedia))));
  }

  if (
    (await hasTable("wish_records")) &&
    (await hasColumn("wish_records", "media_urls"))
  ) {
    const [legacyRows] = await db.query<LegacyWishRecordMediaRow[]>(
      `
        SELECT
          wr.id,
          w.relationship_id,
          wr.created_by_user_id,
          wr.media_urls,
          wr.record_date,
          wr.created_at
        FROM wish_records wr
        INNER JOIN wishes w ON w.id = wr.wish_id
        WHERE ${scope.legacyWishRecords.sql}
          AND wr.media_urls IS NOT NULL
      `,
      scope.legacyWishRecords.values,
    );

    const existingLegacyMedia = new Set(
      media
        .filter((item) => item.sourceType === "wish_record")
        .map((item) => `${item.sourceId}:${item.url}`),
    );

    for (const row of legacyRows) {
      parseLegacyMediaUrls(row).forEach((url, index) => {
        const key = `${row.id}:${url}`;

        if (existingLegacyMedia.has(key)) {
          return;
        }

        media.push({
          id: -(row.id * 1000 + index + 1),
          relationshipId: row.relationship_id,
          createdByUserId: row.created_by_user_id,
          mediaType: inferMediaType(url),
          sourceType: "wish_record",
          sourceId: row.id,
          url,
          thumbnailUrl: "",
          takenAt: formatDateOnly(row.record_date),
          locationName: "",
          latitude: null,
          longitude: null,
          uploadedAt: formatDateTime(row.created_at),
          createdAt: formatDateTime(row.created_at),
        });
      });
    }
  }

  media.sort((first, second) => {
    const byUploadedAt =
      new Date(second.uploadedAt).getTime() - new Date(first.uploadedAt).getTime();

    if (byUploadedAt !== 0) {
      return byUploadedAt;
    }

    return second.id - first.id;
  });

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    message: "get album media success",
    media,
  });
}

export async function createAlbumMedia(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = parseRequestBody(createAlbumMediaSchema, req.body);
  assertObjectKeyBelongsToUser(userId, payload.objectKey);
  const scope = await buildAlbumScope(userId);

  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO album_media (
        relationship_id,
        created_by_user_id,
        media_type,
        source_type,
        source_id,
        object_key,
        url,
        thumbnail_url,
        taken_at,
        location_name,
        latitude,
        longitude
      )
      VALUES (?, ?, ?, 'upload', NULL, ?, '', ?, ?, ?, ?, ?)
    `,
    [
      scope.relationshipId,
      userId,
      payload.mediaType,
      payload.objectKey,
      payload.thumbnailUrl || null,
      payload.takenAt || null,
      payload.locationName || null,
      payload.latitude,
      payload.longitude,
    ],
  );

  const [rows] = await db.query<AlbumMediaRow[]>(
    `
      SELECT
        id,
        relationship_id,
        created_by_user_id,
        media_type,
        source_type,
        source_id,
        object_key,
        url,
        thumbnail_url,
        taken_at,
        location_name,
        latitude,
        longitude,
        created_at
      FROM album_media
      WHERE id = ?
        AND ${scope.media.sql}
      LIMIT 1
    `,
    [result.insertId, ...scope.media.values],
  );

  if (!rows[0]) {
    throw new HttpError(404, "media not found");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.status(201).json({
    message: "create album media success",
    media: await serializeAlbumMedia(rows[0]),
  });
}

export async function getAlbumStories(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  await assertAlbumStoriesTableReady();

  const scope = await buildAlbumScope(userId);
  const stories = await Promise.all(
    (await getStoryRows(scope)).map(serializeAlbumStory),
  );

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    message: "get album stories success",
    stories,
  });
}

export async function getFavoriteAlbumStories(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  await assertAlbumStoriesTableReady();

  const scope = await buildAlbumScope(userId);
  const stories = await Promise.all(
    (await getStoryRows(scope, { favoritesOnly: true })).map(
      serializeAlbumStory,
    ),
  );

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    message: "get favorite album stories success",
    stories,
  });
}

export async function getAlbumStory(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  await assertAlbumStoriesTableReady();

  const storyIdParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  const storyId = parseId(storyIdParam);
  const scope = await buildAlbumScope(userId);
  const storyRows = await getStoryRows(scope, { storyId });
  const storyRow = storyRows[0];

  if (!storyRow) {
    throw new HttpError(404, "album story not found");
  }

  const [mediaRows] = await db.query<AlbumMediaRow[]>(
    `
      SELECT
        id,
        relationship_id,
        created_by_user_id,
        media_type,
        source_type,
        source_id,
        object_key,
        url,
        thumbnail_url,
        taken_at,
        location_name,
        latitude,
        longitude,
        created_at
      FROM album_media
      WHERE source_type = 'story'
        AND source_id = ?
        AND ${scope.media.sql}
      ORDER BY COALESCE(taken_at, created_at) DESC, id DESC
    `,
    [storyId, ...scope.media.values],
  );

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    message: "get album story success",
    story: await serializeAlbumStory(storyRow),
    media: await Promise.all(mediaRows.map(serializeAlbumMedia)),
  });
}

export async function createAlbumStory(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const payload = parseRequestBody(createAlbumStorySchema, req.body);
  await assertAlbumStoriesTableReady();

  const scope = await buildAlbumScope(userId);
  const connection: PoolConnection = await db.getConnection();
  let createdStoryId = 0;

  try {
    await connection.beginTransaction();

    const [storyResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO album_stories (
          relationship_id,
          created_by_user_id,
          title,
          description,
          cover_media_id
        )
        VALUES (?, ?, ?, ?, NULL)
      `,
      [
        scope.relationshipId,
        userId,
        payload.title,
        payload.description || null,
      ],
    );

    const storyId = storyResult.insertId;
    createdStoryId = storyId;
    let coverMediaId: number | null = null;

    if (payload.media.length) {
      payload.media.forEach((media) => {
        assertObjectKeyBelongsToUser(userId, media.objectKey);
      });

      const values = payload.media.map((media) => [
        scope.relationshipId,
        userId,
        media.mediaType,
        "story",
        storyId,
        media.objectKey,
        "",
        media.thumbnailUrl || null,
        media.takenAt || null,
        media.locationName || null,
        media.latitude,
        media.longitude,
      ]);

      const [mediaResult] = await connection.query<ResultSetHeader>(
        `
          INSERT INTO album_media (
            relationship_id,
            created_by_user_id,
            media_type,
            source_type,
            source_id,
            object_key,
            url,
            thumbnail_url,
            taken_at,
            location_name,
            latitude,
            longitude
          )
          VALUES ?
        `,
        [values],
      );

      coverMediaId = mediaResult.insertId;

      await connection.query(
        `
          UPDATE album_stories
          SET cover_media_id = ?
          WHERE id = ?
        `,
        [coverMediaId, storyId],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const storyRows = await getStoryRows(scope, { storyId: createdStoryId });
  const createdStory = storyRows[0];

  if (!createdStory) {
    throw new HttpError(500, "failed to create album story");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.status(201).json({
    message: "create album story success",
    story: await serializeAlbumStory(createdStory),
  });
}

export async function updateAlbumStoryFavorite(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  await assertAlbumStoriesTableReady();

  const payload = parseRequestBody(updateAlbumStoryFavoriteSchema, req.body);
  const storyIdParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  const storyId = parseId(storyIdParam);
  const scope = await buildAlbumScope(userId);
  const storyRows = await getStoryRows(scope, { storyId });

  if (!storyRows[0]) {
    throw new HttpError(404, "album story not found");
  }

  await db.query(
    `
      UPDATE album_stories AS s
      SET is_favorite = ?
      WHERE s.id = ?
        AND ${scope.stories.sql}
    `,
    [payload.isFavorite ? 1 : 0, storyId, ...scope.stories.values],
  );

  const updatedStory = (await getStoryRows(scope, { storyId }))[0];
  if (!updatedStory) {
    throw new HttpError(404, "album story not found");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).json({
    message: "update album story favorite success",
    story: await serializeAlbumStory(updatedStory),
  });
}
