import Knex from "knex";
import { getKnex } from "../database.js";

export abstract class Migrator {
  knex: Knex.Knex<any, unknown[]>;

  constructor() {
    this.knex = getKnex();
  }

  async createLogsTableIfNotExists() {
    throw new Error("Not implemented");
  }
}
