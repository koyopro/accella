import { Model, Rollback } from "accel-record";
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

  test(".transaction() with Promise", async () => {
    const result = await Model.transaction(async () => {
      return "ok";
    });
    expect(result).toBe("ok");
  });

  test(".transaction() with Rollback in Promise", async () => {
    const result = await Model.transaction(async () => {
      throw new Rollback();
    });
    expect(result).toBe(undefined);
  });
});

describe("nested Transaction", () => {
  test("commited, rollbacked ", () => {
    const result = Model.transaction(() => {
      $user.create({ name: "hoge" });
      expect(User.count()).toBe(1);

      Model.transaction(() => {
        $user.create({ name: "fuga" });
        expect(User.count()).toBe(2);
        throw new Rollback();
      });
      expect(User.count()).toBe(1);

      return true;
    }); // commited
    expect(result).toBe(true);
    expect(User.count()).toBe(1);
  });

  test("rollbacked, rollbacked", () => {
    const result = Model.transaction(() => {
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
    expect(result).toBe(undefined);
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
    } catch {
      expect(User.count()).toBe(0);
    }
  });
});
