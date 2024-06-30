import crypto from "crypto";
import fs from "fs";
import Knex from "knex";
import path from "path";
import { getConfig, getKnex } from "./database.js";
import { Migrator } from "./migration/migrator.js";
import { MySQLMigrator } from "./migration/mysqlMigrator.js";
import { PostgresqlMigrator } from "./migration/postgresqlMigrator.js";
import { SqliteMigrator } from "./migration/sqliteMigrator.js";

const logsTable = "_prisma_migrations";

export class Migration {
  knex: Knex.Knex<any, unknown[]>;
  logsMap: Map<any, any>;

  static async migrate() {
    const migrator = this.newMigrator();
    if (process.env.NODE_ENV == "test") {
      await migrator.ensureDatabaseExists();
    }
    return await new this(migrator).applyAllPendingMigrations();
  }

  static newMigrator() {
    switch (getConfig().type) {
      case "mysql":
        return new MySQLMigrator();
      case "pg":
        return new PostgresqlMigrator();
      case "sqlite":
        return new SqliteMigrator();
      default:
        throw new Error("Invalid type");
    }
  }

  constructor(protected migrator: Migrator) {
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
    await this.migrator.createLogsTableIfNotExists();
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
}

const sha256hash = (buffer: Buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};
