import {
  DatabaseCleaner,
  Migration,
  initAccelRecord,
  stopWorker,
} from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import "./models/index.js";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbConfig = () => {
  if (process.env.DB_ENGINE == "mysql") {
    return {
      type: "mysql",
      prismaDir: path.resolve(__dirname, "./prisma_mysql"),
      knexConfig: {
        client: "mysql2",
        // connection: `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`,
        connection: {
          host: "localhost",
          port: 3306,
          user: "root",
          password: "",
          database: `accel_test${process.env.VITEST_POOL_ID}`,
        },
      },
    } as const;
  } else {
    return {
      type: "sqlite",
      prismaDir: path.resolve(__dirname, "./prisma"),
      knexConfig: {
        client: "better-sqlite3",
        useNullAsDefault: true,
        connection: path.resolve(
          __dirname,
          `./prisma/test${process.env.VITEST_POOL_ID}.db`
        ),
      },
    } as const;
  }
};

beforeAll(async () => {
  initAccelRecord(dbConfig());
  await Migration.migrate();
});

beforeEach(async () => {
  DatabaseCleaner.start();
});

afterEach(async () => {
  DatabaseCleaner.clean();
});

afterAll(async () => {
  stopWorker();
});
