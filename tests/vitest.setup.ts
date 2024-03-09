import { initAccelRecord, Model, stopWorker } from "accel-record";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { getKnex } from "accel-record-core/src/database.js";
import "./models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbConfig = (type: "mysql" | "sqlite") => {
  if (type == "mysql") {
    const connection = `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`;
    return {
      type: "mysql",
      datasourceUrl: connection,
      knexConfig: {
        client: "mysql2",
        connection,
      },
    } as const;
  } else {
    const connection = path.resolve(
      __dirname,
      `./prisma/test${process.env.VITEST_POOL_ID}.db`
    );
    return {
      type: "sqlite",
      datasourceUrl: `file:${connection}`,
      knexConfig: {
        client: "better-sqlite3",
        useNullAsDefault: true,
        connection,
      },
    } as const;
  }
};

const sha256hashSync = (buffer: Buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

const execAllPendingMigrations = async (type: "mysql" | "sqlite") => {
  const schemaDir = type == "mysql" ? "prisma_mysql" : "prisma";
  const migrationsPath = path.resolve(__dirname, `./${schemaDir}/migrations`);
  const knex = getKnex();
  const logsTable = "_prisma_migrations";
  // await knex.raw(`CREATE DATABASE IF NOT EXISTS ${database};`);
  if (type == "mysql") {
    await knex.raw(`CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
  \`id\` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`checksum\` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`finished_at\` datetime(3) DEFAULT NULL,
  \`migration_name\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`logs\` text COLLATE utf8mb4_unicode_ci,
  \`rolled_back_at\` datetime(3) DEFAULT NULL,
  \`started_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`applied_steps_count\` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  } else {
    await knex.raw(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                    TEXT PRIMARY KEY NOT NULL,
      "checksum"              TEXT NOT NULL,
      "finished_at"           DATETIME,
      "migration_name"        TEXT NOT NULL,
      "logs"                  TEXT,
      "rolled_back_at"        DATETIME,
      "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
  );`);
  }
  const logs = await knex(logsTable).select("*");
  const logsMap = new Map(logs.map((log) => [log.migration_name, log]));
  let applyCount = 0;
  for (const dir of fs.readdirSync(migrationsPath)) {
    const sqlPath = path.resolve(
      __dirname,
      `./${schemaDir}/migrations/${dir}/migration.sql`
    );
    if (!fs.existsSync(sqlPath)) continue;
    const buffer = fs.readFileSync(sqlPath);
    if (logsMap.get(dir)) continue;
    const startedAt = new Date();
    console.log(`Applying migration \`${dir}\``);
    for (const statement of buffer.toString().split(";")) {
      if (statement.trim() == "") continue;
      await knex.raw(statement);
    }
    const digest = sha256hashSync(buffer);
    await knex(logsTable).insert({
      id: crypto.randomUUID(),
      migration_name: dir,
      checksum: digest,
      started_at: startedAt,
      finished_at: new Date(),
      applied_steps_count: 1,
    });
    applyCount++;
  }
  if (applyCount == 0) {
    console.log(
      "Already in sync, no schema change or pending migration was found."
    );
  }
};

beforeAll(async () => {
  const type = process.env.DB_ENGINE == "mysql" ? "mysql" : "sqlite";
  const config = dbConfig(type);
  initAccelRecord(config);
  await execAllPendingMigrations(type);
});

beforeEach(async () => {
  Model.startTransaction();
});

afterEach(async () => {
  Model.rollbackTransaction();
});

afterAll(async () => {
  stopWorker();
});
