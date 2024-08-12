import Knex from "knex";
import { getConfig, getKnexConfig } from "../database.js";
import { Migrator } from "./migrator.js";

export class PostgresqlMigrator extends Migrator {
  async ensureDatabaseExists() {
    const [database, newConfig] = parseConfig();
    const knex = Knex(newConfig);
    const exists = await knex.raw(
      `SELECT 1 FROM pg_database WHERE datname='${database}'`
    );
    if (exists.rows.length === 0) {
      console.log(`Creating database \`${database}\``);
      await knex.raw(`CREATE DATABASE "${database}"`);
    }
    knex.destroy();
  }

  async createLogsTableIfNotExists() {
    return this.knex.raw(CREATE_LOGS_TABLE_DDL);
  }
}

const parseConfig = () => {
  const config = getConfig();
  const knexConfig = getKnexConfig(config);
  if (typeof knexConfig?.connection == "string") {
    const u = new URL(knexConfig.connection);
    const database = u.pathname.replace("/", "");
    u.pathname = "postgres";
    const newConfig = { ...knexConfig, connection: u.toString() };
    return [database, newConfig];
  } else if (knexConfig) {
    // @ts-ignore
    const { database, ...rest } = knexConfig.connection;
    const newConfig = {
      ...knexConfig,
      connection: { ...rest, database: "postgres" },
    };
    return [database, newConfig];
  } else {
    throw new Error("Invalid knexConfig");
  }
};

const CREATE_LOGS_TABLE_DDL = `CREATE TABLE IF NOT EXISTS public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);`;
