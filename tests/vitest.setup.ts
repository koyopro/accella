import { initAccelRecord, Model, stopWorker } from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import { Migration } from "accel-record";
import "./models/index.js";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbConfig = () => {
  if (process.env.DB_ENGINE == "mysql") {
    const connection = `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`;
    return {
      type: "mysql",
      datasourceUrl: connection,
      prismaDir: path.resolve(__dirname, "./prisma_mysql"),
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
      prismaDir: path.resolve(__dirname, "./prisma"),
      knexConfig: {
        client: "better-sqlite3",
        useNullAsDefault: true,
        connection,
      },
    } as const;
  }
};

beforeAll(async () => {
  initAccelRecord(dbConfig());
  await Migration.migrate();
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
