import { $user } from "../factories/user";
import { User } from "./index";

describe("Query", () => {
  test(".first()", () => {
    expect(User.first()).toBeUndefined();
    $user.create();
    expect(User.first()).not.toBeUndefined();
  });

  test(".exists()", () => {
    expect(User.exists()).toBe(false);
    $user.create();
    expect(User.exists()).toBe(true);
  });

  test(".isEmpty()", () => {
    expect(User.isEmpty()).toBe(true);
    $user.create();
    expect(User.isEmpty()).toBe(false);
  });

  test(".count()", () => {
    expect(User.count()).toBe(0);
    $user.create();
    expect(User.count()).toBe(1);
  });

  test(".order()", () => {
    $user.create({ age: 20 });
    $user.create({ age: 10 });
    expect(User.order("age").first()?.age).toBe(10);
    expect(User.order("age", "desc").first()?.age).toBe(20);
  });

  test(".offset()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    expect(User.offset(1).first()?.name).toBe("fuga");
  });

  test(".limit()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    expect(User.limit(1).toArray()).toHaveLength(1);
  });

  test(".where", () => {
    expect(User.where({ name: "hoge" }).load()).toEqual([]);

    $user.create({ name: "hoge", email: "hoge@example.com" });
    const users = User.where({ name: "hoge" }).load();
    expect(users).toHaveLength(1);
    const u = users[0];
    expect(u).toBeInstanceOf(User);
    expect(u!.name).toBe("hoge");
    expect(u!.email).toBe("hoge@example.com");
  });

  test(".whereNot()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    expect(User.whereNot({ name: "hoge" }).first()?.name).toBe("fuga");
  });

  test(".whereRaw()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    expect(User.whereRaw("age = ?", 30).first()?.name).toBe("fuga");
  });

  test(".find()", () => {
    expect(() => {
      User.find(1);
    }).toThrow("Record Not found");
    const u = $user.create({ name: "hoge", email: "hoge@example.com" });
    const s = User.find(u.id!);
    expect(s).toBeInstanceOf(User);
    expect(s.id).toBe(u.id!);
    expect(s.name).toBe("hoge");
    expect(s.email).toBe("hoge@example.com");
  });

  test(".findBy()", () => {
    expect(User.findBy({ name: "hoge" })).toBeUndefined();

    $user.create({ name: "hoge", email: "hoge@example.com" });
    const u = User.findBy({ name: "hoge" });
    expect(u).toBeInstanceOf(User);
    expect(u!.name).toBe("hoge");
    expect(u!.email).toBe("hoge@example.com");
  });

  test("aggregate", () => {
    $user.create({ age: 21 });
    $user.create({ age: 24 });

    expect(User.minimum("age")).toBe(21);
    expect(User.maximum("age")).toBe(24);
    expect(User.average("age")).toBe(22.5);
  });

  test("select", () => {
    $user.create({ name: "hoge" });

    const users = User.select("name").select("id").toArray();
    expect(users.map((u) => u.name)).toEqual(["hoge"]);
    // @ts-expect-error
    users[0].age;
  });
});
