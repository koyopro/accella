import { $post } from "../factories/post";
import { $setting } from "../factories/setting";
import { $user } from "../factories/user";

const objectContaining = expect.objectContaining;

test("toHash", () => {
  const u = $user.create({ name: "hoge" });
  expect(u.toHash()).toEqual(
    objectContaining({
      id: u.id,
      name: "hoge",
      age: undefined,
    })
  );

  expect(u.toHash({ only: ["name", "age"] })).toEqual({
    name: "hoge",
    age: undefined,
  });

  expect(u.toHash({ except: ["createdAt", "updatedAt", "email"] })).toEqual({
    id: u.id,
    name: "hoge",
    age: undefined,
  });

  expect(u.toHash({ methods: ["isPersisted"] })).toEqual(
    objectContaining({
      id: u.id,
      name: "hoge",
      age: undefined,
      isPersisted: true,
    })
  );
});

test("toHash with include", () => {
  const u = $user.create({ name: "hoge" });
  $post.create({ title: "post1", authorId: u.id });

  expect(u.toHash({ include: "setting" })).toEqual(
    objectContaining({
      id: u.id,
      name: "hoge",
      age: undefined,
      setting: undefined,
    })
  );

  expect(u.toHash({ include: "posts" })).toEqual(
    objectContaining({
      id: u.id,
      name: "hoge",
      age: undefined,
      posts: [objectContaining({ title: "post1", published: false })],
    })
  );

  u.setting = $setting.build({ threshold: 3.0 });

  expect(
    u.toHash({ include: { posts: { only: ["title"] }, setting: {} } })
  ).toEqual(
    objectContaining({
      id: u.id,
      name: "hoge",
      age: undefined,
      posts: [{ title: "post1" }],
      setting: objectContaining({ threshold: 3.0 }),
    })
  );
});

test("toHash with include belongsTo", () => {
  const u = $user.create({
    name: "hoge",
    setting: $setting.build({ threshold: 3.0 }),
  });

  expect(u.setting?.toHash({ include: "user" })).toEqual(
    objectContaining({
      user: objectContaining({
        id: u.id,
        name: "hoge",
      }),
    })
  );

  expect(u.setting?.toHash({ include: { user: { only: ["name"] } } })).toEqual(
    objectContaining({
      user: { name: "hoge" },
    })
  );
});

test("toJson", () => {
  const u = $user.create({ name: "hoge" });

  expect(u.toJson({ only: ["name", "age"] })).toEqual(
    JSON.stringify({
      name: "hoge",
      age: undefined,
    })
  );

  expect(
    u.toJson({
      except: ["createdAt", "updatedAt", "email"],
      methods: ["isPersisted"],
    })
  ).toEqual(
    JSON.stringify({
      id: u.id,
      name: "hoge",
      age: undefined,
      isPersisted: true,
    })
  );
});
