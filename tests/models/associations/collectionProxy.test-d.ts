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
});
