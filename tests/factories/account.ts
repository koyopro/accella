import { defineFactory } from "accel-record-factory";
import { Account } from "../models/index.js";

export const AccountFactory = defineFactory(Account, {
  email: (seq) => `account${seq}@email.com`,
  // passwordDigest: "MyString"
});

export { AccountFactory as $Account };
