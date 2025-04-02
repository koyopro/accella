import { Migrator } from "./migrator.js";

export class SqliteMigrator extends Migrator {
  async ensureDatabaseExists() {
    // when using sqlite, the database file is created automatically
  }

  async createLogsTableIfNotExists() {
    return this.knex.raw(CREATE_LOGS_TABLE_DDL);
  }

  async isDatabaseExists(): Promise<boolean> {
    return true;
  }
}

const CREATE_LOGS_TABLE_DDL = `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);`;
