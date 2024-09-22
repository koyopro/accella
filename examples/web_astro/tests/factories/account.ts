import { defineFactory } from "accel-record-factory";
import { Account } from "../../src/models/index.js";
import { faker } from "@faker-js/faker";

export const AccountFactory = defineFactory(Account, {
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

export { AccountFactory as $Account };
