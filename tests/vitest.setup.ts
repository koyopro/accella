import { Prisma } from "@prisma/client";
import { initAccelRecord, Model, stopWorker } from "accel-record";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import "./models/index.js";

const getPrismaClientConfig = () => {
  const ret = {} as Prisma.PrismaClientOptions;
  if (process.env.VITEST_POOL_ID) {
    ret.datasourceUrl =
      process.env.DB_ENGINE == "mysql"
        ? `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`
        : `file:./test${process.env.VITEST_POOL_ID}.db`;
  }
  return ret;
};

beforeAll(() => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const type = process.env.DB_ENGINE == "mysql" ? "mysql" : "sqlite";
  const knexConfig =
    type == "mysql"
      ? {
          client: "mysql2",
          connection: `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`,
        }
      : {
          client: "better-sqlite3",
          useNullAsDefault: true,
          connection: {
            filename: path.resolve(
              __dirname,
              `./prisma/test${process.env.VITEST_POOL_ID}.db`
            ),
          },
        };
  initAccelRecord({ type, knexConfig });

  process.env.DATABASE_URL = getPrismaClientConfig().datasourceUrl;
  const schemaDir = type == "mysql" ? "prisma_mysql" : "prisma";
  const schemaPath = path.resolve(__dirname, `./${schemaDir}/schema.prisma`);
  execSync(`npx prisma migrate dev --schema=${schemaPath} --skip-generate`, {
    stdio: "inherit",
  });
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
