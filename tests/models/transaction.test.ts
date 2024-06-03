import { Model, Rollback } from "accel-record-core";
import { $user } from "../factories/user";
import { User } from "./index.js";

describe("Transaction", () => {
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
  test("commited, rollbacked ", () => {
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
  });

  test("rollbacked, rollbacked", () => {
    Model.transaction(() => {
      $user.create({ name: "hoge" });
      expect(User.count()).toBe(1);

      Model.transaction(() => {
        $user.create({ name: "fuga" });
        expect(User.count()).toBe(2);
        throw new Rollback();
      });
      expect(User.count()).toBe(1);
      throw new Rollback();
    }); // rollbacked
    expect(User.count()).toBe(0);
  });

  test("with Error", () => {
    try {
      Model.transaction(() => {
        $user.create({ name: "hoge" });
        expect(User.count()).toBe(1);

        Model.transaction(() => {
          $user.create({ name: "fuga" });
          expect(User.count()).toBe(2);
          throw new Error();
        });
        // It will not reach here
        assert(false);
      }); // rollbacked
    } catch (e) {
      expect(User.count()).toBe(0);
    }
  });
});
