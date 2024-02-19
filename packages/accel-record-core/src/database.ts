import { fileURLToPath } from "url";
import path from "path";
import Knex from "knex";
import SyncRpc from "./sync-rpc/index.cjs";
import { loadDmmf } from "./fields";

export const knex = Knex({
  client: "better-sqlite3",
  connection: ":memory:",
  useNullAsDefault: true,
});

loadDmmf();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, "./worker.cjs");

export const rpcClient = SyncRpc(configPath, {});
