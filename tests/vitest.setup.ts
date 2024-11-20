import { DatabaseCleaner, Migration, initAccelRecord, stopWorker } from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import "./models/index.js";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const dbConfig = () => {
  if (process.env.DB_ENGINE == "mysql") {
    return {
      type: "mysql",
      // logLevel: "DEBUG",
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
  } else if (process.env.DB_ENGINE == "pg") {
    return {
      type: "pg",
      // logLevel: "DEBUG",
      prismaDir: path.resolve(__dirname, "./prisma_pg"),
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
      type: "sqlite",
      // logLevel: "DEBUG",
      prismaDir: path.resolve(__dirname, "./prisma"),
      knexConfig: {
        client: "better-sqlite3",
        connection: path.resolve(__dirname, `./prisma/test${process.env.VITEST_POOL_ID}.db`),
      },
    } as const;
  }
};

beforeAll(async () => {
  await initAccelRecord(dbConfig());
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
