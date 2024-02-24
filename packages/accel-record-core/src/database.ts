import { Prisma } from "@prisma/client";
import Knex from "knex";
import path from "path";
import { fileURLToPath } from "url";
import { loadDmmf } from "./fields";
import SyncRpc from "./sync-rpc/index.cjs";

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

export const stopRpcClient = () => {
  SyncRpc.stop();
};
