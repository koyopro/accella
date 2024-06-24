import { Post } from "..";
import { $user } from "../../factories/user";
import { PostModel } from "../post";

describe("setter / getter", () => {
  test("NewUser#posts", () => {
    const u = $user.build();
    expectTypeOf(u.posts.first()).toMatchTypeOf<PostModel | undefined>();
    assertType((u.posts = [Post.build({})]));
    assertType(u.posts.push([Post.build({})]));
  });

  test("User#posts", () => {
    const u = $user.create();
    expectTypeOf(u.posts.first()).toMatchTypeOf<Post | undefined>();
    assertType((u.posts = [Post.build({})]));
    assertType(u.posts.push([Post.build({})]));
  });

  test("Relation methods", () => {
    const u = $user.create();
    expectTypeOf(u.posts.where({ id: 1 }).toArray()).toMatchTypeOf<Post[]>();
    expectTypeOf(u.posts.whereNot({ id: 1 }).toArray()).toMatchTypeOf<Post[]>();
    expectTypeOf(u.posts.whereRaw("").toArray()).toMatchTypeOf<Post[]>();
    expectTypeOf(u.posts.order("id").toArray()).toMatchTypeOf<Post[]>();
    expectTypeOf(u.posts.joins("tags").toArray()).toMatchTypeOf<Post[]>();
    expectTypeOf(u.posts.includes("tags").toArray()).toMatchTypeOf<Post[]>();
    expectTypeOf(u.posts.minimum("id")).toMatchTypeOf<number>();
    expectTypeOf(u.posts.maximum("id")).toMatchTypeOf<number>();
    expectTypeOf(u.posts.average("id")).toMatchTypeOf<number>();
    expectTypeOf(u.posts.updateAll({ id: 1 })).toMatchTypeOf<void>();
    expectTypeOf(u.posts.select("id").toArray()).toMatchTypeOf<
      { id: number }[]
    >();
    expectTypeOf(u.posts.pluck("id")).toMatchTypeOf<number[]>();
    // @ts-expect-error
    u.posts.where({ foo: 1 });
    // @ts-expect-error
    u.posts.whereNot({ foo: 1 });
    // @ts-expect-error
    u.posts.order("foo");
    // @ts-expect-error
    u.posts.joins("bar");
    // @ts-expect-error
    u.posts.includes("baz");
    // @ts-expect-error
    u.posts.minimum("foo");
    // @ts-expect-error
    u.posts.maximum("foo");
    // @ts-expect-error
    u.posts.average("foo");
    // @ts-expect-error
    u.posts.updateAll({ foo: 1 });
    // @ts-expect-error
    u.posts.select("foo");
    // @ts-expect-error
    u.posts.pluck("foo");
  });
});
