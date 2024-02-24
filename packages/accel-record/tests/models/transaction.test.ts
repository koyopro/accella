import { Model, Rollback } from "accel-record-core";
import { $user } from "../factories/user";
import { User } from "./user.js";

describe("Transaction", () => {
  beforeEach(() => {
    Model.rollbackTransaction(); // for transaction for each test
  });
  afterEach(() => {
    Model.startTransaction(); // for transaction for each test
  });
  test(".transaction()", () => {
    Model.transaction(() => {
      $user.create({ name: "hoge" });
      expect(User.all().toArray()).toHaveLength(1);
      throw new Rollback();
    });
    expect(User.all().toArray()).toHaveLength(0);
  });
});
