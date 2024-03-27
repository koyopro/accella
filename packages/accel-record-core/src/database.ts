import Knex from "knex";
import path from "path";
import { fileURLToPath } from "url";
import { loadDmmf } from "./fields.js";
import { Model } from "./index.js";
// @ts-ignore
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

const getKnexConfig = (config: Config) => {
  if (config.knexConfig) return config.knexConfig;
  if (config.datasourceUrl) {
    const client = config.type == "mysql" ? "mysql2" : "better-sqlite3";
    return { client, connection: config.datasourceUrl };
  }
};

const setupKnex = (config: Config) => {
  const knexConfig = getKnexConfig(config);
  if (knexConfig) {
    return Knex(knexConfig);
  }
  throw new Error(
    "No config for knex. Please call initAccelRecord(config) first."
  );
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Config {
  type: "mysql" | "sqlite";
  datasourceUrl?: string;
  knexConfig?: Knex.Knex.Config;
  prismaDir?: string;
}
let _config: Config = { type: "sqlite" };
let _rpcClient: any;
export const initAccelRecord = async (config: Config) => {
  _config = config;

  stopRpcClient();
  _rpcClient = SyncRpc(path.resolve(__dirname, "./worker.cjs"), {
    knexConfig: getKnexConfig(config),
  });
  await loadDmmf();

  Model.client.constructor.prototype.execute = function () {
    return exec(this);
  };
};

let _knex: Knex.Knex | undefined;
export const getKnex = () => {
  return (_knex ||= setupKnex(_config));
};

export const getConfig = () => {
  return _config;
};

export const exec = (queryBuilder: Knex.Knex.QueryBuilder<any, any>) => {
  return execSQL(queryBuilder.toSQL());
};

export const execSQL = (params: {
  sql: string;
  bindings: readonly any[];
}): any => {
  const { sql, bindings } = params;
  const startTime = Date.now();
  if (!_rpcClient || !_config) {
    throw new Error("Please call initAccelRecord(config) first.");
  }
  const ret = _rpcClient(params);
  const time = Date.now() - startTime;
  const color = /begin|commit|rollback/i.test(sql) ? "\x1b[36m" : "\x1b[32m";
  logger.info(`  \x1b[36mSQL(${time}ms)  ${color}${sql}\x1b[39m`, bindings);
  return _config.type == "mysql" ? ret[0] : ret;
};

export const stopRpcClient = () => {
  SyncRpc.stop();
};
