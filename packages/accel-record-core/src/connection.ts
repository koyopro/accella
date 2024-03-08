import { getConfig, getKnex } from "./database.js";
import { Model } from "./index.js";

export class Connection {
  static get connection() {
    return {
      adapterName: getConfig().type,
      knex: getKnex(),
      returningUsable: () => {
        return ["sqlite"].includes(getConfig().type);
      },
    };
  }

  static get client() {
    return this.connection.knex((this as typeof Model).tableName);
  }

  get client() {
    return (this.constructor as typeof Connection).client;
  }
}
