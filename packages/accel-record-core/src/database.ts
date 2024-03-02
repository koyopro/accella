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

export const knex = Knex({
  client: "better-sqlite3",
  connection: ":memory:",
  useNullAsDefault: true,
});

loadDmmf();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "./worker.cjs");

export const getPrismaClientConfig = () => {
  const ret = {} as Prisma.PrismaClientOptions;
  if (process.env.VITEST_POOL_ID) {
    ret.datasourceUrl = `file:./test${process.env.VITEST_POOL_ID}.db`;
  }
  return ret;
};

export const rpcClient = SyncRpc(configPath, {
  prismaClientConfig: getPrismaClientConfig(),
});

export const execSQL = (params: {
  type?: "query" | "execute";
  sql: string;
  bindings: readonly any[];
}): any => {
  const { sql, bindings } = params;
  if (params.type == "query") {
    logger.info(`  \x1b[36mSQL  \x1b[34m${sql}\x1b[39m`, bindings);
  } else {
    const color = /begin|commit|rollback/i.test(sql) ? "\x1b[36m" : "\x1b[32m";
    logger.info(`  \x1b[36mSQL  ${color}${sql}\x1b[39m`, bindings);
  }
  return rpcClient(params);
};

export const stopRpcClient = () => {
  SyncRpc.stop();
};
