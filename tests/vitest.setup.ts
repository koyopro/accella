import { DatabaseCleaner, Migration, initAccelRecord, stopWorker } from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import "./models/index.js";
import { getDatabaseConfig } from "./models/index.js";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const dbConfig = () => {
  const config = getDatabaseConfig();
  if (process.env.DB_ENGINE == "mysql") {
    return {
      ...config,
      // logLevel: "DEBUG",
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
  } else if (process.env.DB_ENGINE == "pg") {
    return {
      ...config,
      // logLevel: "DEBUG",
      datasourceUrl: `postgresql://test:password@localhost:5432/accel_test${process.env.VITEST_POOL_ID}`,
      // knexConfig: {
      //   client: "pg",
      //   connection: {
      //     host: "localhost",
      //     port: 5432,
      //     user: "test",
      //     password: "password",
      //     database: `accel_test${process.env.VITEST_POOL_ID}`,
      //   },
      // },
      sqlTransformer: (sql: string) => {
        for (const table of ["Setting", "User", "Post", "PostTag"]) {
          sql = sql.replace(new RegExp(`(\\s|[^"])(${table})(\\s|\\.)`, "g"), `$1"$2"$3`);
        }
        return sql;
      },
    } as const;
  } else {
    return {
      ...config,
      // logLevel: "DEBUG",
      knexConfig: {
        client: "better-sqlite3",
        connection: path.resolve(__dirname, `./prisma/test${process.env.VITEST_POOL_ID}.db`),
      },
    } as const;
  }
};

beforeAll(async () => {
  const v = Number(process.versions?.node?.split(".")?.[0]);
  const sync = isFinite(v) && v >= 22 ? "thread" : "process";
  await initAccelRecord({ ...dbConfig(), sync });
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
