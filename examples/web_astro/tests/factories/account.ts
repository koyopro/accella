import { defineFactory } from "accel-record-factory";
import { Account } from "../../src/models/index.js";

export const AccountFactory = defineFactory(Account, {
  // email: "MyString",
  // passwordDigest: "MyString"
});

export { AccountFactory as $Account };
