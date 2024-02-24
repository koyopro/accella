import { $user } from "../factories/user";
import { UserMeta } from "./user";
import { User } from "./user";

describe("Relation", () => {
  test("#toArray()", () => {
    $user.createList(2);
    expect(User.all().toArray()).toHaveLength(2);
  });

  test("#map()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    const names = User.all().map((user) => user.name);
    expect(names).toEqual(["hoge", "fuga"]);
  });

  test("#first()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    expect(User.all().first()?.name).toBe("hoge");
  });

  test("#count()", () => {
    $user.createList(2);
    expect(User.all().count()).toBe(2);
  });

  test("#exists()", () => {
    expect(User.all().exists()).toBe(false);
    $user.create();
    expect(User.all().exists()).toBe(true);
  });

  test("#isEmpty()", () => {
    expect(User.all().isEmpty()).toBe(true);
    $user.create();
    expect(User.all().isEmpty()).toBe(false);
  });

  test("#limit()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    const users = User.all().limit(1).toArray();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("hoge");
  });

  test("#offset()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    const users = User.all().offset(1).limit(1).toArray();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("fuga");
  });

  test("#order()", () => {
    $user.create({ name: "fuga" });
    $user.create({ name: "hoge" });
    expect(User.all().order("name").first()?.name).toBe("fuga");
    expect(User.all().order("name", "desc").first()?.name).toBe("hoge");
  });

  test("#where()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    $user.create({ name: "piyo", age: undefined });
    expect(User.all().where({ name: "fuga" }).first()?.name).toBe("fuga");
    expect(User.all().where({ name: "hoge", age: 20 }).first()?.name).toBe(
      "hoge"
    );
    expect(
      User.all().where({ name: "fuga" }).where({ age: 20 }).first()
    ).toBeUndefined();
    expect(
      User.all().where({ name: "fuga" }).where({ name: "hoge" }).first()
    ).toBeUndefined();
    expect(User.all().where({ age: null }).first()?.name).toBe("piyo");
  });

  test("#where() with compare", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    expect(User.all().where({ age: 20 }).first()?.name).toBe("hoge");
    expect(
      User.all()
        .where({ age: { ">": 20 } })
        .first()?.name
    ).toBe("fuga");
  });

  test("#where() with string filter", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    const subject = (where: UserMeta["WhereInput"]) =>
      User.where(where).map((u) => u.name);
    expect(subject({ name: { startsWith: "ho" } })).toStrictEqual(["hoge"]);
    expect(subject({ name: { endsWith: "ga" } })).toStrictEqual(["fuga"]);
    expect(subject({ name: { contains: "og" } })).toStrictEqual(["hoge"]);
    expect(subject({ name: { like: "%ug%" } })).toStrictEqual(["fuga"]);
  });

  test("#where() in", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    $user.create({ name: "piyo", age: 40 });
    expect(
      User.all()
        .where({ age: { in: [20, 30] } })
        .toArray()
    ).toHaveLength(2);
    expect(
      User.all()
        .where({ age: [20, 30] })
        .toArray()
    ).toHaveLength(2);
  });

  test("#whereNot()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    expect(User.all().whereNot({ age: 20 }).first()?.name).toBe("fuga");
    expect(
      User.all()
        .whereNot({ age: { ">": 20 } })
        .first()?.name
    ).toBe("hoge");
    expect(
      User.all()
        .whereNot({ age: { in: [20] } })
        .first()?.name
    ).toBe("fuga");
    expect(User.all().whereNot({ age: null }).first()?.name).toBe("hoge");
  });

  test("#whereRaw()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    expect(User.all().whereRaw("age = ?", [30]).first()?.name).toBe("fuga");
    expect(User.all().whereRaw("age IS NOT NULL").first()?.name).toBe("hoge");
  });
});
