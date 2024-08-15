/* eslint-disable */
const Knex = require("knex");
const fs = require("fs");

const log = (data) => {
  fs.appendFile("query.log", JSON.stringify(data, null, 2) + "\n", (err) => {});
};

function init(connection) {
  const knex = Knex(connection.knexConfig);
  return function (query) {
    const { sql, bindings } = query;
    return connection.knexConfig.client === "pg"
      ? postgresPromise(knex, sql, bindings)
      : knex.raw(sql, bindings);
  };
}

function postgresPromise(knex, sql, bindings) {
  return new Promise(async (resolve, error) => {
    try {
      const { command, rowCount, rows } = await knex.raw(sql, bindings);
      return resolve({ command, rows, rowCount });
    } catch (err) {
      return error(err);
    }
  });
}

module.exports = init;
