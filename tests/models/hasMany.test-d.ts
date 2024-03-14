import { NewPost, NewUser, Post, User } from ".";
import { $post } from "../factories/post";
import { $user } from "../factories/user";
import { PostModel } from "./post";

describe("getter/setter types", () => {
  test("new & new", () => {
    const user = $user.build();
    expectTypeOf(user).toMatchTypeOf<NewUser>();

    const post = $post.build();
    expectTypeOf(post).toMatchTypeOf<NewPost>();

    expectTypeOf(user.posts.toArray()).toMatchTypeOf<PostModel[]>();
    assertType(user.posts.push(post));
  });

  test("new & persisted", () => {
    const user = $user.build();
    expectTypeOf(user).toMatchTypeOf<NewUser>();

    const post = $post.create();
    expectTypeOf(post).toMatchTypeOf<Post>();

    expectTypeOf(user.posts.toArray()).toMatchTypeOf<PostModel[]>();
    assertType(user.posts.push(post));
  });

  test("persisted & new", () => {
    const user = $user.create();
    expectTypeOf(user).toMatchTypeOf<User>();

    const post = $post.build();
    expectTypeOf(post).toMatchTypeOf<NewPost>();

    expectTypeOf(user.posts.toArray()).toMatchTypeOf<PostModel[]>();
    assertType(user.posts.push(post));
  });

  test("persisted & persisted", () => {
    const user = $user.create();
    expectTypeOf(user).toMatchTypeOf<User>();

    const post = $post.create();
    expectTypeOf(post).toMatchTypeOf<Post>();

    expectTypeOf(user.posts.toArray()).toMatchTypeOf<PostModel[]>();
    assertType(user.posts.push(post));
  });
});
