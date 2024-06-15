import { $setting } from "../factories/setting";
import { $user } from "../factories/user";
import { Post, User } from "./index";

describe("User#tojson()", () => {
  test.only("", () => {
    const u = $user.create({ name: "hoge" });
    u.fuga();
  });
  test(".build()", () => {
    const u = User.build({ name: "hoge" });
    expect(u).toBeInstanceOf(User);
    expect(u.name).toBe("hoge");
  });

  test(".create()", () => {
    const u = User.create({ name: "hoge", email: "hoge@example.com" });
    expect(u).toBeInstanceOf(User);
    expect(u.email).toBe("hoge@example.com");
  });

  test(".all()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });

    {
      /*
      This means you can use iterator to load all users.

      for (const user of User.all()) {
        console.log(user);
      }
      */
      const users = [...User.all()];
      expect(users[0]!.name).toEqual("hoge");
      expect(users[1]!.name).toEqual("fuga");
    }
    {
      const users = User.all().load();
      expect(users[0].name).toEqual("hoge");
      expect(users[1].name).toEqual("fuga");
    }
  });

  test(".count()", () => {
    expect(User.count()).toBe(0);
    $user.create({ name: "hoge" });
    expect(User.count()).toBe(1);
  });

  test("#isPersisted()", () => {
    expect($user.build().isPersisted()).toBe(false);
    expect($user.create().isPersisted()).toBe(true);
  });

  test(".includes()", () => {
    const u = $user.create();
    Post.create({ title: "post1", authorId: u.id });
    Post.create({ title: "post2", authorId: u.id });

    const author = User.includes("posts").first()!;
    const beforeCount = User.connection.queryCount;
    expect(author.posts.toArray()).toHaveLength(2);
    expect(author.posts.toArray()[0]).toBeInstanceOf(Post);
    expect(author.posts.toArray()[0].title).toBe("post1");
    expect(author.posts.toArray()[1].title).toBe("post2");
    expect(User.connection.queryCount).toBe(beforeCount);
  });

  test.skip("associations", () => {
    expect(User.associations.posts).toEqual({
      klass: "Post",
      table: "post",
      primaryKey: "id",
      foreignKey: "authorId",
      field: expect.anything(),
    });
  });

  test("#reload()", () => {
    const u = $user.create({ name: "hoge" });
    const s = $setting.create({ user: u });
    u.name = "fuga";
    expect(u.posts.toArray()).toHaveLength(0);
    expect(u.setting).toBeDefined();

    Post.create({ title: "post1", author: u });
    s.destroy();

    expect(u.reload().name).toBe("hoge");
    expect(u.name).toBe("hoge");
    expect(u.posts.toArray()).toHaveLength(1);
    expect(u.setting).toBeUndefined();
  });
});
