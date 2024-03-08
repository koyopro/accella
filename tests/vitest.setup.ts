import { initAccelRecord, Model, stopWorker } from "accel-record";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

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

beforeAll(() => {
  const type = process.env.DB_ENGINE == "mysql" ? "mysql" : "sqlite";
  const config = dbConfig(type);
  initAccelRecord(config);
  process.env.DATABASE_URL = config.datasourceUrl;
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
