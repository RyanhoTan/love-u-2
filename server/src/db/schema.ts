import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import db from "./index.js";

interface LockRow extends RowDataPacket {
  locked: number;
}

interface ColumnNameRow extends RowDataPacket {
  COLUMN_NAME: string;
}

type ColumnDefinition = {
  name: string;
  definition: string;
};

type TableDefinition = {
  name: string;
  createSql: string;
  columns: readonly ColumnDefinition[];
};

const SCHEMA_LOCK_NAME = "love-u-2:schema";

const tableDefinitions: readonly TableDefinition[] = [
  {
    name: "users",
    createSql: `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nickname VARCHAR(30) NULL,
        avatar VARCHAR(2048) NULL,
        signature VARCHAR(200) NULL,
        birthday DATE NULL,
        gender VARCHAR(20) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uniq_users_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "username", definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
      { name: "password_hash", definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
      { name: "nickname", definition: "VARCHAR(30) NULL" },
      { name: "avatar", definition: "VARCHAR(2048) NULL" },
      { name: "signature", definition: "VARCHAR(200) NULL" },
      { name: "birthday", definition: "DATE NULL" },
      { name: "gender", definition: "VARCHAR(20) NULL" },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "updated_at",
        definition:
          "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)",
      },
    ],
  },
  {
    name: "couple_relationships",
    createSql: `
      CREATE TABLE IF NOT EXISTS couple_relationships (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_a_id BIGINT UNSIGNED NOT NULL,
        user_b_id BIGINT UNSIGNED NOT NULL,
        anniversary_date DATE NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'bound',
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        unbound_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        INDEX idx_couple_relationship_user_a (user_a_id, status),
        INDEX idx_couple_relationship_user_b (user_b_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "user_a_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "user_b_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "anniversary_date", definition: "DATE NULL" },
      { name: "status", definition: "VARCHAR(20) NOT NULL DEFAULT 'bound'" },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "updated_at",
        definition:
          "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)",
      },
      { name: "unbound_at", definition: "DATETIME(3) NULL" },
    ],
  },
  {
    name: "couple_invites",
    createSql: `
      CREATE TABLE IF NOT EXISTS couple_invites (
        code VARCHAR(12) NOT NULL,
        inviter_user_id BIGINT UNSIGNED NOT NULL,
        invitee_user_id BIGINT UNSIGNED NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        expires_at DATETIME(3) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        used_at DATETIME(3) NULL,
        PRIMARY KEY (code),
        INDEX idx_couple_invites_inviter_status (inviter_user_id, status, expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "code", definition: "VARCHAR(12) NOT NULL DEFAULT ''" },
      { name: "inviter_user_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "invitee_user_id", definition: "BIGINT UNSIGNED NULL" },
      { name: "status", definition: "VARCHAR(20) NOT NULL DEFAULT 'pending'" },
      {
        name: "expires_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "updated_at",
        definition:
          "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)",
      },
      { name: "used_at", definition: "DATETIME(3) NULL" },
    ],
  },
  {
    name: "wishes",
    createSql: `
      CREATE TABLE IF NOT EXISTS wishes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        relationship_id BIGINT UNSIGNED NULL,
        created_by_user_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(1000) NULL,
        cover VARCHAR(2048) NULL,
        target_date DATE NOT NULL,
        location_name VARCHAR(100) NULL,
        latitude DECIMAL(10, 7) NULL,
        longitude DECIMAL(10, 7) NULL,
        budget_amount INT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'todo',
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at DATETIME(3) NULL,
        delete_expires_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        INDEX idx_wishes_relationship_status (relationship_id, status, deleted_at),
        INDEX idx_wishes_creator_status (created_by_user_id, status, deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "relationship_id", definition: "BIGINT UNSIGNED NULL" },
      { name: "created_by_user_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "title", definition: "VARCHAR(100) NOT NULL DEFAULT ''" },
      { name: "description", definition: "VARCHAR(1000) NULL" },
      { name: "cover", definition: "VARCHAR(2048) NULL" },
      { name: "target_date", definition: "DATE NOT NULL DEFAULT '1000-01-01'" },
      { name: "location_name", definition: "VARCHAR(100) NULL" },
      { name: "latitude", definition: "DECIMAL(10, 7) NULL" },
      { name: "longitude", definition: "DECIMAL(10, 7) NULL" },
      { name: "budget_amount", definition: "INT NULL" },
      { name: "status", definition: "VARCHAR(20) NOT NULL DEFAULT 'todo'" },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "updated_at",
        definition:
          "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)",
      },
      { name: "deleted_at", definition: "DATETIME(3) NULL" },
      { name: "delete_expires_at", definition: "DATETIME(3) NULL" },
    ],
  },
  {
    name: "wish_records",
    createSql: `
      CREATE TABLE IF NOT EXISTS wish_records (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        wish_id BIGINT UNSIGNED NOT NULL,
        created_by_user_id BIGINT UNSIGNED NOT NULL,
        content VARCHAR(1000) NULL,
        record_date DATE NOT NULL,
        mood VARCHAR(50) NULL,
        location_name VARCHAR(100) NULL,
        latitude DECIMAL(10, 7) NULL,
        longitude DECIMAL(10, 7) NULL,
        budget_amount INT NULL,
        media_urls JSON NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_wish_records_wish_date (wish_id, record_date, id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "wish_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "created_by_user_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "content", definition: "VARCHAR(1000) NULL" },
      { name: "record_date", definition: "DATE NOT NULL DEFAULT '1000-01-01'" },
      { name: "mood", definition: "VARCHAR(50) NULL" },
      { name: "location_name", definition: "VARCHAR(100) NULL" },
      { name: "latitude", definition: "DECIMAL(10, 7) NULL" },
      { name: "longitude", definition: "DECIMAL(10, 7) NULL" },
      { name: "budget_amount", definition: "INT NULL" },
      { name: "media_urls", definition: "JSON NULL" },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "updated_at",
        definition:
          "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)",
      },
    ],
  },
  {
    name: "album_media",
    createSql: `
      CREATE TABLE IF NOT EXISTS album_media (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        relationship_id BIGINT UNSIGNED NULL,
        created_by_user_id BIGINT UNSIGNED NOT NULL,
        media_type VARCHAR(20) NOT NULL,
        source_type VARCHAR(20) NOT NULL,
        source_id BIGINT UNSIGNED NULL,
        url VARCHAR(2048) NOT NULL,
        thumbnail_url VARCHAR(2048) NULL,
        taken_at DATE NULL,
        location_name VARCHAR(100) NULL,
        latitude DECIMAL(10, 7) NULL,
        longitude DECIMAL(10, 7) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_album_media_scope (relationship_id, created_by_user_id, created_at),
        INDEX idx_album_media_source (source_type, source_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "relationship_id", definition: "BIGINT UNSIGNED NULL" },
      { name: "created_by_user_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "media_type", definition: "VARCHAR(20) NOT NULL DEFAULT 'image'" },
      { name: "source_type", definition: "VARCHAR(20) NOT NULL DEFAULT 'upload'" },
      { name: "source_id", definition: "BIGINT UNSIGNED NULL" },
      { name: "url", definition: "VARCHAR(2048) NOT NULL DEFAULT ''" },
      { name: "thumbnail_url", definition: "VARCHAR(2048) NULL" },
      { name: "taken_at", definition: "DATE NULL" },
      { name: "location_name", definition: "VARCHAR(100) NULL" },
      { name: "latitude", definition: "DECIMAL(10, 7) NULL" },
      { name: "longitude", definition: "DECIMAL(10, 7) NULL" },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
    ],
  },
  {
    name: "album_stories",
    createSql: `
      CREATE TABLE IF NOT EXISTS album_stories (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        relationship_id BIGINT UNSIGNED NULL,
        created_by_user_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(200) NOT NULL,
        description VARCHAR(5000) NULL,
        cover_media_id BIGINT UNSIGNED NULL,
        is_favorite TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_album_stories_scope (relationship_id, created_by_user_id, updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "relationship_id", definition: "BIGINT UNSIGNED NULL" },
      { name: "created_by_user_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "title", definition: "VARCHAR(200) NOT NULL DEFAULT ''" },
      { name: "description", definition: "VARCHAR(5000) NULL" },
      { name: "cover_media_id", definition: "BIGINT UNSIGNED NULL" },
      { name: "is_favorite", definition: "TINYINT(1) NOT NULL DEFAULT 0" },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "updated_at",
        definition:
          "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)",
      },
    ],
  },
  {
    name: "anniversaries",
    createSql: `
      CREATE TABLE IF NOT EXISTS anniversaries (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        relationship_id BIGINT UNSIGNED NOT NULL,
        created_by_user_id BIGINT UNSIGNED NULL,
        title VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        original_date DATE NOT NULL,
        repeat_type VARCHAR(20) NOT NULL DEFAULT 'none',
        reminder_days_before INT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        INDEX idx_anniversaries_relationship_status (relationship_id, status, original_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "relationship_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "created_by_user_id", definition: "BIGINT UNSIGNED NULL" },
      { name: "title", definition: "VARCHAR(100) NOT NULL DEFAULT ''" },
      { name: "type", definition: "VARCHAR(20) NOT NULL DEFAULT 'custom'" },
      { name: "original_date", definition: "DATE NOT NULL DEFAULT '1000-01-01'" },
      { name: "repeat_type", definition: "VARCHAR(20) NOT NULL DEFAULT 'none'" },
      { name: "reminder_days_before", definition: "INT NOT NULL DEFAULT 0" },
      { name: "status", definition: "VARCHAR(20) NOT NULL DEFAULT 'active'" },
      {
        name: "created_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      {
        name: "updated_at",
        definition:
          "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)",
      },
      { name: "deleted_at", definition: "DATETIME(3) NULL" },
    ],
  },
  {
    name: "partner_chat_messages",
    createSql: `
      CREATE TABLE IF NOT EXISTS partner_chat_messages (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        relationship_id BIGINT UNSIGNED NOT NULL,
        sender_id BIGINT UNSIGNED NOT NULL,
        receiver_id BIGINT UNSIGNED NOT NULL,
        text VARCHAR(2000) NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'text',
        audio_url VARCHAR(2048) NULL,
        audio_duration_seconds DOUBLE NULL,
        client_message_id VARCHAR(100) NULL,
        sent_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        delivered_at DATETIME(3) NULL,
        read_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        INDEX idx_partner_chat_receiver_pending (receiver_id, relationship_id, delivered_at, id),
        INDEX idx_partner_chat_receiver_unread (receiver_id, relationship_id, read_at, id),
        INDEX idx_partner_chat_relationship_sent (relationship_id, id),
        UNIQUE KEY uniq_partner_chat_client_message (sender_id, client_message_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
    columns: [
      { name: "id", definition: "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY" },
      { name: "relationship_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "sender_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "receiver_id", definition: "BIGINT UNSIGNED NOT NULL DEFAULT 0" },
      { name: "text", definition: "VARCHAR(2000) NULL" },
      { name: "message_type", definition: "VARCHAR(20) NOT NULL DEFAULT 'text'" },
      { name: "audio_url", definition: "VARCHAR(2048) NULL" },
      { name: "audio_duration_seconds", definition: "DOUBLE NULL" },
      { name: "client_message_id", definition: "VARCHAR(100) NULL" },
      {
        name: "sent_at",
        definition: "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
      },
      { name: "delivered_at", definition: "DATETIME(3) NULL" },
      { name: "read_at", definition: "DATETIME(3) NULL" },
    ],
  },
];

async function getTableColumns(connection: PoolConnection, tableName: string) {
  const [rows] = await connection.query<ColumnNameRow[]>(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
    [tableName],
  );

  return new Set(rows.map((row) => row.COLUMN_NAME));
}

async function ensureTableColumns(
  connection: PoolConnection,
  table: TableDefinition,
) {
  const columns = await getTableColumns(connection, table.name);

  for (const column of table.columns) {
    if (columns.has(column.name)) {
      continue;
    }

    await connection.query(
      `ALTER TABLE \`${table.name}\` ADD COLUMN \`${column.name}\` ${column.definition}`,
    );
    columns.add(column.name);
    console.log(`Added missing database column ${table.name}.${column.name}`);
  }
}

async function initializeDatabaseSchema() {
  const connection = await db.getConnection();

  try {
    const [lockRows] = await connection.query<LockRow[]>(
      "SELECT GET_LOCK(?, 30) AS locked",
      [SCHEMA_LOCK_NAME],
    );

    if (lockRows[0]?.locked !== 1) {
      throw new Error("could not acquire database schema lock");
    }

    try {
      for (const table of tableDefinitions) {
        await connection.query(table.createSql);
        await ensureTableColumns(connection, table);
      }
    } finally {
      await connection.query("SELECT RELEASE_LOCK(?)", [SCHEMA_LOCK_NAME]);
    }
  } finally {
    connection.release();
  }
}

let schemaReadyPromise: Promise<void> | null = null;

export function ensureDatabaseSchema() {
  schemaReadyPromise ??= initializeDatabaseSchema();
  return schemaReadyPromise;
}
