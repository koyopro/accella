import { RecordNotFound } from "accel-record";
import { $post } from "../factories/post";
import { $user } from "../factories/user";
import { User } from "./index";

describe("Query", () => {
  test(".first()", () => {
    expect(User.first()).toBeUndefined();
    $user.create();
    expect(User.first()).not.toBeUndefined();

    expect(User.first(1)).toHaveLength(1);
  });

  test(".last()", () => {
    expect(User.last()).toBeUndefined();
    for (const name of ["hoge", "fuga", "piyo"]) $user.create({ name });
    expect(User.last()?.name).toBe("piyo");

    expect(User.last(2).map((u) => u.name)).toEqual(["piyo", "fuga"]);
  });

  test("findOrCreateBy", () => {
    {
      const u = User.findOrCreateBy({ email: "foo@example.com" }, (u) => {
        u.name = "foo";
      });
      expect(u.name).toBe("foo");
      expect(u.email).toBe("foo@example.com");
      expect(u.isPersisted()).toBe(true);
      u.save();
      expect(User.count()).toBe(1);
    }
    {
      const u = User.findOrCreateBy({ email: "foo@example.com" }, (u) => {
        u.name = "bar";
      });
      expect(u.name).toBe("foo");
      expect(u.email).toBe("foo@example.com");
      expect(u.isPersisted()).toBe(true);
      expect(User.count()).toBe(1);
    }
  });

  test("findOrInitializeBy", () => {
    {
      const u = User.findOrInitializeBy({ email: "foo@example.com" }, (u) => {
        u.name = "foo";
      });
      expect(u.name).toBe("foo");
      expect(u.email).toBe("foo@example.com");
      expect(u.isPersisted()).toBe(false);
      u.save();
      expect(User.count()).toBe(1);
    }
    {
      const u = User.findOrInitializeBy({ email: "foo@example.com" }, (u) => {
        u.name = "bar";
      });
      expect(u.name).toBe("foo");
      expect(u.email).toBe("foo@example.com");
      expect(u.isPersisted()).toBe(true);
      u.save();
      expect(User.count()).toBe(1);
    }
  });

  test("updateAll", () => {
    $user.createList(2, {});
    expect(User.where({ name: "baz" }).count()).toBe(0);

    User.updateAll({ name: "baz", age: undefined });

    expect(User.where({ name: "baz" }).count()).toBe(2);
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
    try {
      User.find(1);
    } catch (e) {
      expect(e).toBeInstanceOf(RecordNotFound);
    }
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

  test("pluck", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });

    expect(User.pluck("name")).toEqual(["hoge", "fuga"]);
  });

  test("select", () => {
    $user.create({ name: "hoge" });

    const users = User.select("name").select("id").toArray();
    expect(users.map((u) => u.name)).toEqual(["hoge"]);
    // @ts-expect-error
    users[0].age;
  });

  test("joins", () => {
    $post.create({ author: $user.create(), title: "title1" });

    const cnt = User.joins("posts").where("Post.title = ?", "title1").count();
    expect(cnt).toBe(1);
  });

  test("joinsRaw", () => {
    $post.create({ author: $user.create(), title: "title1" });

    const cnt = User.joinsRaw("INNER JOIN Post ON author_id = User._id")
      .where("Post.title = ?", "title1")
      .count();
    expect(cnt).toBe(1);
  });

  test("#findEach()", () => {
    for (const name of ["foo", "bar", "baz"]) {
      $user.create({ name });
    }
    const results: User[] = [];
    for (const record of User.findEach({ batchSize: 2 })) {
      results.push(record);
    }
    expect(results.map((u) => u.name)).toEqual(["foo", "bar", "baz"]);
  });

  test("#findInBatches()", () => {
    for (const name of ["foo", "bar", "baz"]) {
      $user.create({ name });
    }
    const results: User[][] = [];
    for (const records of User.findInBatches({ batchSize: 2 })) {
      results.push(records);
    }
    expect(results.length).toBe(2);
    expect(results[0].map((u) => u.name)).toEqual(["foo", "bar"]);
    expect(results[1].map((u) => u.name)).toEqual(["baz"]);
  });
});
