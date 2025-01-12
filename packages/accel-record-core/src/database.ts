import Knex from "knex";
import { buildSyncClient, SyncClient } from "./database/sync.js";
import { loadDmmf } from "./fields.js";
import { Model } from "./index.js";
import { loadI18n } from "./model/naming.js";

const log = (logLevel: LogLevel, ...args: any[]) => {
  if (LogLevel.indexOf(logLevel) >= LogLevel.indexOf(_config.logLevel ?? "WARN")) {
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

function setDefaultTimezone(connection: string): string;
function setDefaultTimezone(connection: any): any;
function setDefaultTimezone(connection: string | any) {
  if (typeof connection == "string") {
    const parsedUrl = new URL(connection);
    if (!parsedUrl.searchParams.has("timezone")) {
      parsedUrl.searchParams.set("timezone", "Z");
      return parsedUrl.toString();
    }
    return connection;
  } else {
    connection.timezone ??= "Z";
    return connection;
  }
}

export const getKnexConfig = (config: Config) => {
  const detectClient = (type: Config["type"]) =>
    type == "mysql" ? "mysql2" : type == "sqlite" ? "better-sqlite3" : "pg";
  const baseConfig = config.knexConfig ?? {
    client: detectClient(config.type),
    connection: config.datasourceUrl,
  };
  if (config.type == "sqlite") baseConfig.useNullAsDefault ??= true;
  if (config.type == "mysql") baseConfig.connection = setDefaultTimezone(baseConfig.connection);

  return baseConfig;
};

const setupKnex = (config: Config) => {
  const knexConfig = getKnexConfig(config);
  if (knexConfig) {
    return Knex(knexConfig);
  }
  throw new Error("No config for knex. Please call initAccelRecord(config) first.");
};

export const LogLevel = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"] as const;
export type LogLevel = (typeof LogLevel)[number];

export interface Config {
  type: "mysql" | "sqlite" | "pg" | "postgresql";
  logLevel?: LogLevel;
  logger?: Logger;
  /**
   * For sqlite, it's the path to the database file.
   * For mysql and pg, it's the connection string.
   * If knexConfig is set, this will be ignored.
   *
   * @example
   * ```
   * sqlite: path.resolve(__dirname, `./prisma/test${process.env.VITEST_POOL_ID}.db`)
   * mysql: `mysql://myuser:password@localhost:3306/test_database${process.env.VITEST_POOL_ID}`
   * pg: `postgresql://myuser:password@localhost:5432/test_database${process.env.VITEST_POOL_ID}`
   * ```
   */
  datasourceUrl?: string;
  /**
   * If knexConfig is set, it will be used to create the knex instance.
   * If not set, it will be generated from type and datasourceUrl.
   * @see https://knexjs.org/guide/#configuration-options
   * @example
   * ```
   * {
   *   client: "mysql2",
   *   connection: {
   *     host: "localhost",
   *     port: 3306,
   *     user: "root",
   *     password: "",
   *     database: `accel_test${process.env.VITEST_POOL_ID}`,
   *     timezone: "Z",
   *   }
   * }
   * ```
   */
  knexConfig?: Knex.Knex.Config;
  /**
   * The path to the prisma directory.
   * This is necessary for performing database migration before running tests.
   *
   * @example
   * ```
   * path.resolve(__dirname, "./prisma")
   * ```
   */
  prismaDir?: string;
  /**
   * A function to transform the SQL before executing.
   */
  sqlTransformer?: (sql: string) => string;
  /**
   * The sync mode for the database worker.
   * - "process": Uses child_process. This is the default.
   * - "thread": Uses worker_threads. This is faster but has known race condition issues in Node versions below 21.
   */
  sync?: "process" | "thread";
}
let _config: Config = { type: "sqlite" };

let _syncClient: SyncClient | undefined;

let _queryCount: number = 0;
export const initAccelRecord = async (config: Config) => {
  if (_syncClient) {
    log("WARN", "initAccelRecord() has already been called.");
    return;
  }
  _config = Object.assign({}, config);
  _config.logLevel ??= "WARN";
  _config.sync ??= "process";
  if (_config.type == "postgresql") _config.type = "pg";

  _syncClient = buildSyncClient(_config.sync, { knexConfig: getKnexConfig(config) });
  await loadDmmf();
  await loadI18n();

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

export const exec = (queryBuilder: Knex.Knex.QueryBuilder<any, any>, logLevel?: LogLevel) => {
  return execSQL({ ...queryBuilder.toSQL(), logLevel });
};

export const execSQL = (params: {
  sql: string;
  bindings: readonly any[];
  logLevel?: LogLevel;
}): any => {
  params.sql = _config.sqlTransformer?.(params.sql) ?? params.sql;
  const { sql, bindings } = params;
  const startTime = Date.now();
  if (!_syncClient || !_config) {
    throw new Error("Please call initAccelRecord(config) first.");
  }
  const ret = _syncClient.execSQL(params);
  const time = Date.now() - startTime;
  const color = /begin|commit|rollback/i.test(sql) ? "\x1b[36m" : "\x1b[32m";
  log(params.logLevel ?? "DEBUG", `  \x1b[36mSQL(${time}ms)  ${color}${sql}\x1b[39m`, bindings);
  _queryCount++;
  return formatByEngine(ret);
};

const formatByEngine = (ret: any) => {
  if (_config.type == "pg") {
    if (ret.command == "SELECT" || ret.rows.length > 0) {
      return ret.rows;
    } else {
      return ret;
    }
  }
  return _config.type == "mysql" ? ret[0] : ret;
};

export const stopRpcClient = () => {
  _syncClient?.stopWorker();
};
