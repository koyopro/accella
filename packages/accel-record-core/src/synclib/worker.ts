/* eslint-disable */
import Knex from "knex";
import fs from "fs";
import { launchSyncWorker } from "./index.js";

const log = (data: object) => {
  fs.appendFile("query.log", JSON.stringify(data, null, 2) + "\n", (err) => {});
};

let knex: Knex.Knex;
let knexConfig: any;

function init(connection: { knexConfig: any }) {
  knexConfig = connection.knexConfig;
  knex = Knex(knexConfig);
}

function execSQL(query: { sql: string; bindings: readonly any[] }) {
  const { sql, bindings } = query;
  return knexConfig.client === "pg"
    ? postgresPromise(knex, sql, bindings)
    : knex.raw(sql, bindings);
}

function postgresPromise(knex: Knex.Knex, sql: string, bindings: readonly any[]) {
  return new Promise(async (resolve, error) => {
    try {
      const { command, rowCount, rows } = await knex.raw(sql, bindings);
      return resolve({ command, rows, rowCount });
    } catch (err) {
      return error(err);
    }
  });
}

export const { actions, getWorker, stopWorker } = launchSyncWorker(import.meta.filename, {
  init,
  execSQL,
});
