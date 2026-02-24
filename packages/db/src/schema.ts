export const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    discord_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    display_name TEXT,
    avatar_hash TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS guild_configs (
    id TEXT PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL UNIQUE,
    prefix TEXT NOT NULL DEFAULT '!',
    locale TEXT NOT NULL DEFAULT 'en',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,
];

export const TABLES = {
  users: 'users',
  sessions: 'sessions',
  guildConfigs: 'guild_configs',
} as const;
