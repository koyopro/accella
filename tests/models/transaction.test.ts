import { Model, Rollback } from "accel-record-core";
import { $user } from "../factories/user";
import { User } from "./index.js";

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

describe("nested Transaction", () => {
  beforeEach(() => {
    Model.rollbackTransaction(); // for transaction for each test
  });
  afterEach(() => {
    Model.startTransaction(); // for transaction for each test
  });

  test(".transaction()", () => {
    User.all().deleteAll();
    Model.transaction(() => {
      $user.create({ name: "hoge" });
      expect(User.count()).toBe(1);

      Model.transaction(() => {
        $user.create({ name: "fuga" });
        expect(User.count()).toBe(2);
        throw new Rollback();
      });
      expect(User.count()).toBe(1);
    }); // commited
    expect(User.count()).toBe(1);
    User.all().deleteAll();
  });

  test(".transaction()", () => {
    User.all().deleteAll();
    Model.transaction(() => {
      $user.create({ name: "hoge" });
      expect(User.count()).toBe(1);

      Model.transaction(() => {
        $user.create({ name: "fuga" });
        expect(User.count()).toBe(2);
        throw new Rollback();
      });
      throw new Rollback();
    }); // rollbacked
    expect(User.count()).toBe(0);
    User.all().deleteAll();
  });
});
