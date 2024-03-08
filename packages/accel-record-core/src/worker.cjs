const Knex = require("knex");

function init(connection) {
  const knex = Knex(connection.knexConfig);
  return function (query) {
    const { sql, bindings } = query;
    return knex.raw(sql, bindings);
  };
}
module.exports = init;
