import { execSQL, getConfig, getKnex, getQueryCount } from "./database.js";
import { Model } from "./index.js";

export class Connection {
  static get connection() {
    return {
      adapterName: getConfig().type,
      knex: getKnex(),
      returningUsable: () => {
        return ["sqlite"].includes(getConfig().type);
      },
      execute: (sql: string, bindings: any[]) => {
        return execSQL({ sql, bindings });
      },
      get queryCount() {
        return getQueryCount();
      },
    };
  }

  static get queryBuilder() {
    return this.connection.knex((this as typeof Model).tableName).clone();
  }

  get queryBuilder() {
    return (this.constructor as typeof Connection).queryBuilder;
  }
}
