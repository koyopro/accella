import Knex from "knex";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getConfig, getKnex } from "./database.js";

const logsTable = "_prisma_migrations";

export class Migration {
  knex: Knex.Knex<any, unknown[]>;
  logsMap: Map<any, any>;

  static migrate() {
    return new this().applyAllPendingMigrations();
  }

  constructor() {
    this.knex = getKnex();
    this.logsMap = new Map();
  }

  get type() {
    return getConfig().type;
  }

  get prismaDir() {
    const { prismaDir } = getConfig();
    if (!prismaDir) throw new Error("prismaDir is not set in config.");
    return prismaDir;
  }

  get migrationsPath() {
    return path.resolve(this.prismaDir, `./migrations`);
  }

  async applyAllPendingMigrations() {
    // await knex.raw(`CREATE DATABASE IF NOT EXISTS ${database};`);
    await this.createLogsTableIfNotExists();
    await this.resetLogsMap();
    let applyCount = 0;
    for (const dir of fs.readdirSync(this.migrationsPath)) {
      if (await this.applyIfPending(dir)) {
        applyCount++;
      }
    }
    // if (applyCount == 0) {
    //   console.log(
    //     "Already in sync, no schema change or pending migration was found."
    //   );
    // }
  }

  protected async resetLogsMap() {
    const logs = await this.knex(logsTable).select("*");
    this.logsMap = new Map(logs.map((log) => [log.migration_name, log]));
  }

  protected async apply(dir: string, buffer: Buffer) {
    const startedAt = new Date();
    console.log(`Applying migration \`${dir}\``);
    for (const statement of buffer.toString().split(";")) {
      if (statement.trim() == "") continue;
      await this.knex.raw(statement);
    }
    await this.knex(logsTable).insert({
      id: crypto.randomUUID(),
      migration_name: dir,
      checksum: sha256hash(buffer),
      started_at: startedAt,
      finished_at: new Date(),
      applied_steps_count: 1,
    });
  }

  protected async applyIfPending(dir: string): Promise<boolean> {
    const sqlPath = path.resolve(
      this.prismaDir,
      `./migrations/${dir}/migration.sql`
    );
    if (!fs.existsSync(sqlPath)) return false;
    if (!this.isPending(dir)) return false;

    const buffer = fs.readFileSync(sqlPath);
    await this.apply(dir, buffer);

    return true;
  }

  protected isPending(dir: string) {
    return !this.logsMap.get(dir);
  }

  protected async createLogsTableIfNotExists() {
    return this.knex.raw(this.type == "mysql" ? MYSQL_DDL : SQLITE_DDL);
  }
}

const sha256hash = (buffer: Buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

const MYSQL_DDL = `CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
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

const SQLITE_DDL = `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);`;
