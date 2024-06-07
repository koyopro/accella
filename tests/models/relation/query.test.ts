import { $user } from "../../factories/user";
import { User } from "../_types";

test("#first()", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  $user.create({ name: "piyo" });
  expect(User.all().first()?.name).toBe("hoge");

  expect(
    User.all()
      .first(2)
      .map((u) => u.name)
  ).toEqual(["hoge", "fuga"]);
});

test("#first() with order", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  $user.create({ name: "piyo" });
  expect(User.all().order("name").first()?.name).toBe("fuga");

  expect(
    User.all()
      .order("name")
      .first(2)
      .map((u) => u.name)
  ).toEqual(["fuga", "hoge"]);
});

test("#last()", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  $user.create({ name: "piyo" });
  expect(User.all().last()?.name).toBe("piyo");

  expect(
    User.all()
      .last(2)
      .map((u) => u.name)
  ).toEqual(["piyo", "fuga"]);
});

test("#last() with order", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  $user.create({ name: "piyo" });
  expect(User.all().order("name").last()?.name).toBe("piyo");

  expect(
    User.all()
      .order("name")
      .last(2)
      .map((u) => u.name)
  ).toEqual(["piyo", "hoge"]);
});

test("#offset()", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  const users = User.all().offset(1).limit(1).toArray();
  expect(users).toHaveLength(1);
  expect(users[0].name).toBe("fuga");
});

test("#limit()", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  const users = User.all().limit(1).toArray();
  expect(users).toHaveLength(1);
  expect(users[0].name).toBe("hoge");
});

test("#order()", () => {
  $user.create({ name: "fuga" });
  $user.create({ name: "hoge" });
  expect(User.all().order("name").first()?.name).toBe("fuga");
  expect(User.all().order("name", "desc").first()?.name).toBe("hoge");
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

test("updateAll", () => {
  $user.createList(1, { name: "foo", age: 20 });
  $user.createList(2, { name: "bar", age: 30 });

  User.where({ name: "bar" }).updateAll({ name: "baz", age: undefined });

  expect(User.where({ name: "foo" }).count()).toBe(1);
  expect(User.where({ name: "bar" }).count()).toBe(0);
  expect(User.where({ name: "baz" }).count()).toBe(2);

  expect(User.where({ age: undefined }).count()).toBe(2);
});

test("#deleteAll()", () => {
  $user.createList(2, { age: 20 });
  $user.createList(2, { age: 30 });
  expect(User.all().count()).toBe(4);
  User.where({ age: 30 }).deleteAll();
  expect(User.all().count()).toBe(2);
});

test("#destroyAll()", () => {
  $user.createList(2, { age: 20 });
  $user.createList(2, { age: 30 });
  expect(User.all().count()).toBe(4);
  User.where({ age: 30 }).destroyAll();
  expect(User.all().count()).toBe(2);
});

test("#pluck()", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga" });
  expect(User.all().pluck("name")).toEqual(["hoge", "fuga"]);
});
