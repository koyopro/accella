import { knex } from "./database.js";

export abstract class Connection {
  static table: string;

  static get client() {
    return knex(this.table);
  }

  get client() {
    return knex((this.constructor as any).table);
  }
}
