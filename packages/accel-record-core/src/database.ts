import { Prisma } from "@prisma/client";
import Knex from "knex";
import path from "path";
import { fileURLToPath } from "url";
import { loadDmmf } from "./fields";
import SyncRpc from "./sync-rpc/index.cjs";

const DEBUG = false;

const output = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

const logger = {
  debug: output,
  info: output,
  error: output,
};

const setupKnex = () => {
  if (process.env.DB_ENGINE == "mysql") {
    return Knex({ client: "mysql2" });
  }
  return Knex({
    client: "better-sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
  });
};

export const knex = setupKnex();

loadDmmf();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "./worker.cjs");

export const getPrismaClientConfig = () => {
  const ret = {} as Prisma.PrismaClientOptions;
  if (process.env.VITEST_POOL_ID) {
    ret.datasourceUrl =
      process.env.DB_ENGINE == "mysql"
        ? `mysql://root:@localhost:3306/accel_test${process.env.VITEST_POOL_ID}`
        : `file:./test${process.env.VITEST_POOL_ID}.db`;
  }
  return ret;
};

export const rpcClient = SyncRpc(configPath, {
  // prismaClientConfig: getPrismaClientConfig(),
  knexConfig:
    process.env.DB_ENGINE == "mysql"
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
              `../../../tests/prisma/test${process.env.VITEST_POOL_ID}.db`
            ),
          },
        },
});

export const execSQL = (params: {
  type?: "query" | "execute";
  sql: string;
  bindings: readonly any[];
}): any => {
  const { sql, bindings } = params;
  const startTime = Date.now();
  const ret = rpcClient(params);
  const time = Date.now() - startTime;
  if (params.type == "query") {
    logger.info(`  \x1b[36mSQL(${time}ms)  \x1b[34m${sql}\x1b[39m`, bindings);
  } else {
    const color = /begin|commit|rollback/i.test(sql) ? "\x1b[36m" : "\x1b[32m";
    logger.info(`  \x1b[36mSQL(${time}ms)  ${color}${sql}\x1b[39m`, bindings);
  }
  return process.env.DB_ENGINE == "mysql" ? ret[0] : ret;
};

export const stopRpcClient = () => {
  SyncRpc.stop();
};
