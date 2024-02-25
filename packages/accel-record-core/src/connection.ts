import { knex } from "./database.js";

export class Connection {
  static get client() {
    return knex((this as any).table);
  }

  get client() {
    return (this.constructor as typeof Connection).client;
  }
}
