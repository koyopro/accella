import Knex from "knex";
import { getConfig, getKnexConfig } from "../database.js";
import { Migrator } from "./migrator.js";

export class MySQLMigrator extends Migrator {
  async ensureDatabaseExists() {
    const [database, newConfig] = parseConfig();
    const knex = Knex(newConfig);
    const exists = await knex.raw(`SHOW DATABASES LIKE "${database}";`);
    if (exists[0].length == 0) {
      console.log(`Creating database \`${database}\``);
      await knex.raw(`CREATE DATABASE ${database};`);
    }
    knex.destroy();
  }

  async isDatabaseExists(): Promise<boolean> {
    const [database, newConfig] = parseConfig();
    const knex = Knex(newConfig);
    const exists = await knex.raw(`SHOW DATABASES LIKE "${database}";`);
    const result = exists[0].length > 0;
    knex.destroy();
    return result;
  }

  async createLogsTableIfNotExists() {
    return this.knex.raw(CREATE_LOGS_TABLE_DDL);
  }
}

const parseConfig = () => {
  const knexConfig = getKnexConfig(getConfig());
  if (typeof knexConfig?.connection == "string") {
    const u = new URL(knexConfig.connection);
    const database = u.pathname.replace("/", "");
    u.pathname = "";
    const newConfig = { ...knexConfig, connection: u.toString() };
    return [database, newConfig];
  } else if (knexConfig) {
    // @ts-ignore
    const { database, ...rest } = knexConfig.connection;
    const newConfig = { ...knexConfig, connection: rest };
    return [database, newConfig];
  } else {
    throw new Error("Invalid knexConfig");
  }
};

const CREATE_LOGS_TABLE_DDL = `CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
  \`id\` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`checksum\` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`finished_at\` datetime(3) DEFAULT NULL,
  \`migration_name\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`logs\` text COLLATE utf8mb4_unicode_ci,
  \`rolled_back_at\` datetime(3) DEFAULT NULL,
  \`started_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`applied_steps_count\` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
