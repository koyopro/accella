import { knex } from "./database.js";
import { Model } from "./index.js";

export class Connection {
  static get client() {
    return knex((this as typeof Model).tableName);
  }

  get client() {
    return (this.constructor as typeof Connection).client;
  }
}
