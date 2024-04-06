import { execSQL, getConfig, getKnex, getQueryCount } from "./database.js";
import { Model } from "./index.js";

/**
 * Represents a connection to a database.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Connection {
  /**
   * Gets the connection object.
   */
  static get connection() {
    return {
      /**
       * The name of the database adapter.
       */
      adapterName: getConfig().type,

      /**
       * The Knex instance for executing queries.
       */
      knex: getKnex(),

      /**
       * Checks if the database adapter supports returning clause.
       */
      returningUsable: () => {
        return ["sqlite"].includes(getConfig().type);
      },

      /**
       * Executes an SQL query with the given bindings.
       * @param sql - The SQL query string.
       * @param bindings - The parameter bindings for the query.
       * @returns The query result.
       */
      execute: (sql: string, bindings: any[]) => {
        return execSQL({ sql, bindings });
      },

      /**
       * Gets the total number of queries executed.
       */
      get queryCount() {
        return getQueryCount();
      },
    };
  }

  /**
   * Gets the query builder for this connection.
   */
  static get queryBuilder() {
    return this.connection.knex((this as typeof Model).tableName).clone();
  }

  /**
   * Gets the query builder for this connection instance.
   */
  get queryBuilder() {
    return (this.constructor as typeof Connection).queryBuilder;
  }
}
