import Knex from "knex";
import path from "path";
import { fileURLToPath } from "url";
import { loadDmmf } from "./fields.js";
import { Model } from "./index.js";
// @ts-ignore
import SyncRpc from "./sync-rpc/index.cjs";

const log = (logLevel: LogLevel, ...args: any[]) => {
  if (
    LogLevel.indexOf(logLevel) >= LogLevel.indexOf(_config.logLevel ?? "WARN")
  ) {
    const func = (logLevel.toLowerCase() ?? "info") as keyof Logger;
    const logger = _config.logger ?? defaultLogger;
    logger[func](...args);
  }
};

const defaultLogger = {
  trace: console.log as (...args: any[]) => any,
  debug: console.debug as (...args: any[]) => any,
  info: console.info as (...args: any[]) => any,
  warn: console.warn as (...args: any[]) => any,
  error: console.error as (...args: any[]) => any,
  fatal: console.error as (...args: any[]) => any,
};
export type Logger = typeof defaultLogger;

export const getKnexConfig = (config: Config) => {
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

export const LogLevel = [
  "TRACE",
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR",
  "FATAL",
] as const;
export type LogLevel = (typeof LogLevel)[number];

export interface Config {
  type: "mysql" | "sqlite";
  logLevel?: LogLevel;
  logger?: Logger;
  datasourceUrl?: string;
  knexConfig?: Knex.Knex.Config;
  prismaDir?: string;
}
let _config: Config = { type: "sqlite" };
let _rpcClient: any;
let _queryCount: number = 0;
export const initAccelRecord = async (config: Config) => {
  _config = config;
  _config.logLevel ??= "WARN";

  stopRpcClient();
  _rpcClient = SyncRpc(path.resolve(__dirname, "./worker.cjs"), {
    knexConfig: getKnexConfig(config),
  });
  await loadDmmf();

  Model.queryBuilder.constructor.prototype.execute = function () {
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

export const getQueryCount = () => {
  return _queryCount;
};

export const exec = (
  queryBuilder: Knex.Knex.QueryBuilder<any, any>,
  logLevel?: LogLevel
) => {
  return execSQL({ ...queryBuilder.toSQL(), logLevel });
};

export const execSQL = (params: {
  sql: string;
  bindings: readonly any[];
  logLevel?: LogLevel;
}): any => {
  const { sql, bindings } = params;
  const startTime = Date.now();
  if (!_rpcClient || !_config) {
    throw new Error("Please call initAccelRecord(config) first.");
  }
  const ret = _rpcClient(params);
  const time = Date.now() - startTime;
  const color = /begin|commit|rollback/i.test(sql) ? "\x1b[36m" : "\x1b[32m";
  log(
    params.logLevel ?? "DEBUG",
    `  \x1b[36mSQL(${time}ms)  ${color}${sql}\x1b[39m`,
    bindings
  );
  _queryCount++;
  return _config.type == "mysql" ? ret[0] : ret;
};

export const stopRpcClient = () => {
  SyncRpc.stop();
};
