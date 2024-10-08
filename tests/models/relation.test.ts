import { $post } from "../factories/post";
import { $postTag } from "../factories/postTag";
import { $setting } from "../factories/setting";
import { $user } from "../factories/user";
import { Post, User } from "./index";

describe("Relation", () => {
  test("#toArray()", () => {
    $user.createList(2);
    const users = User.all().toArray();
    expect(users).toHaveLength(2);
    expect(users[0]).toBeInstanceOf(User);
    expect(users[0].isNewRecord).toBe(false);
  });

  test("#map()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    const names = User.all().map((user) => user.name);
    expect(names).toEqual(["hoge", "fuga"]);
  });

  test("#where()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    $user.create({ name: "piyo", age: undefined });
    expect(User.all().where({ name: "fuga" }).first()?.name).toBe("fuga");
    expect(User.all().where({ name: "hoge", age: 20 }).first()?.name).toBe("hoge");
    expect(User.all().where({ name: "fuga" }).where({ age: 20 }).first()).toBeUndefined();
    expect(User.all().where({ name: "fuga" }).where({ name: "hoge" }).first()).toBeUndefined();
    expect(User.all().where({ age: undefined }).first()?.name).toBe("piyo");
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
    const subject = (where: Parameters<typeof User.findBy>[0]) =>
      User.where(where).map((u) => u.name);
    expect(subject({ name: { startsWith: "ho" } })).toStrictEqual(["hoge"]);
    expect(subject({ name: { endsWith: "ga" } })).toStrictEqual(["fuga"]);
    expect(subject({ name: { contains: "og" } })).toStrictEqual(["hoge"]);
    expect(subject({ name: { like: "%ug%" } })).toStrictEqual(["fuga"]);
  });

  test("#where() with Date filter", () => {
    const now = new Date();
    $user.create({ name: "hoge", createdAt: now });
    $user.create({ name: "fuga", createdAt: new Date(now.getTime() + 1000) });
    expect(User.findBy({ createdAt: { "<=": now } })?.name).toStrictEqual("hoge");
    expect(User.findBy({ createdAt: { ">": now } })?.name).toStrictEqual("fuga");
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

  test("#where() with association", () => {
    const users = $user.createList(2);
    $post.createList(2, { author: users[0] });
    $post.createList(1, { author: users[1] });
    expect(Post.all().where({ author: users[0] }).count()).toBe(2);
    expect(Post.all().where({ author: users }).count()).toBe(3);
    expect(Post.all().where({ author: [] }).count()).toBe(0);
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
    expect(User.all().whereNot({ age: undefined }).first()?.name).toBe("hoge");
    expect(User.all().whereNot({ age: null }).first()?.name).toBe("hoge");
  });

  test("#whereNot() with association", () => {
    const users = $user.createList(2);
    $post.createList(2, { author: users[0] });
    $post.createList(1, { author: users[1] });
    expect(Post.all().whereNot({ author: users[0] }).count()).toBe(1);
    expect(Post.all().whereNot({ author: users }).count()).toBe(0);
    expect(Post.all().whereNot({ author: [] }).count()).toBe(3);
  });

  test("#whereRaw()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    expect(User.all().whereRaw("age = ?", 30).first()?.name).toBe("fuga");
    expect(User.all().where("age >= ?", 30).first()?.name).toBe("fuga");
    expect(User.all().where("age IS NOT NULL").first()?.name).toBe("hoge");
  });

  test("#or()", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });
    expect(
      User.all()
        .where({ name: "hoge" })
        .where({ age: 20 })
        .or(User.where({ name: "fuga" }).where({ age: 30 }))
        .count()
    ).toBe(2);
    expect(
      User.all().where({ name: "hoge" }).where({ age: 20 }).or({ name: "fuga", age: 30 }).count()
    ).toBe(2);
  });

  test("#or() with contains", () => {
    $user.create({ name: "baz" });
    $user.create({ name: "foobar", email: "barfoo@example.com" });
    $user.create({ name: "foo", email: "bar@example.com" });
    $user.create({ name: "bar" });

    const r = User.where({ name: { contains: "baz" } }).or(
      User.where({
        email: { contains: "bar" },
        name: { contains: "bar" },
      })
    );
    expect(r.count()).toBe(2);
  });

  test("includes", () => {
    const u = $user.create();
    Post.create({ title: "post1", authorId: u.id });
    Post.create({ title: "post2", authorId: u.id });

    const author = User.all().includes("posts").first()!;
    const beforeCount = User.connection.queryCount;
    expect(author.posts.toArray()).toHaveLength(2);
    expect(author.posts.toArray()[0]).toBeInstanceOf(Post);
    expect(author.posts.toArray()[0].title).toBe("post1");
    expect(author.posts.toArray()[1].title).toBe("post2");
    expect(User.connection.queryCount).toBe(beforeCount);
  });

  test("select", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });

    const users = User.all().select("name").select("id").toArray();
    expect(users.map((u) => u.name)).toEqual(["hoge", "fuga"]);
    expect(users[0] instanceof User).toBeFalsy();
    // @ts-expect-error
    users[0].age;
  });

  test("joins hasOne", () => {
    $setting.create({ user: $user.create(), threshold: 10 });
    $setting.create({ user: $user.create(), threshold: 20 });

    const r = User.joins("setting");
    expect(r.where("Setting.threshold > ?", 10).count()).toBe(1);
    expect(r.where({ setting: { threshold: 10 } }).count()).toBe(1);
    expect(r.where({ setting: { threshold: 10 }, id: -1 }).count()).toBe(0);
    expect(r.where({ setting: { threshold: { ">": 10 } } }).count()).toBe(1);
  });

  test("joins belongsTo", () => {
    const u = $user.create({ name: "foo" });
    Post.create({ title: "post1", authorId: u.id });

    const r = Post.joins("author");
    const column = User.attributeToColumn("name")!;
    expect(r.where(`User.${column} = ?`, "foo").first()?.title).toBe("post1");
    expect(r.where({ author: { name: "foo" } }).first()?.title).toBe("post1");
    expect(r.where({ author: { name: "bar" } }).first()).toBe(undefined);
  });

  test("joins hasMany", () => {
    const u = $user.create();
    Post.create({ title: "post1", authorId: u.id });
    Post.create({ title: "post2", authorId: u.id });

    const r = User.joins("posts");
    expect(r.where("Post.title = ?", "post1").count()).toBe(1);
    expect(r.where({ posts: { title: "post1" } }).count()).toBe(1);
    expect(r.where({ posts: { title: "post0" } }).count()).toBe(0);
    expect(r.where({ posts: { title: "post1", content: "" } }).count()).toBe(0);
  });

  test("joins hasManyThrough", () => {
    const p1 = $post.create({ author: $user.create(), title: "post1" });
    const p2 = $post.create({ author: $user.create(), title: "post2" });
    const t1 = $postTag.create({ name: "tag1" });
    const t2 = $postTag.create({ name: "tag2" });

    p1.tags = [t1, t2];
    p2.tags = [t1];

    const r = Post.joins("tags");
    expect(r.where("PostTag.name = ?", "tag1").count()).toBe(2);
    expect(r.where({ tags: { name: "tag1", id: { ">": 0 } } }).count()).toBe(2);

    expect(r.where("PostTag.name = ?", "tag2").count()).toBe(1);
    expect(r.where({ tags: { name: "tag2" } }).count()).toBe(1);
  });

  test("joinsRaw", () => {
    $setting.create({ user: $user.create(), threshold: 10 });
    $setting.create({ user: $user.create(), threshold: 20 });

    const cnt = User.all()
      .joinsRaw("join Setting on Setting.user_id = User._id")
      .where("Setting.threshold > ?", 10)
      .count();
    expect(cnt).toBe(1);
  });

  test("queryBuilder", () => {
    $user.create({ name: "hoge", age: 20 });
    $user.create({ name: "fuga", age: 30 });

    const column = User.attributeToColumn("name")!;
    const r = User.where({ age: 20 }).queryBuilder.select(column).groupBy(column).execute();
    expect(r.length).toBe(1);
  });
});
