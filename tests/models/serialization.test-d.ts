import { $setting } from "tests/factories/setting";
import { $user } from "../factories/user";

test("toHash", () => {
  const u = $user.create();

  expectTypeOf(u.toHash()).toEqualTypeOf<{
    id: number;
    name: string | undefined;
    age: number | undefined;
    email: string;
    passwordDigest: string | undefined;
    createdAt: Date;
    updatedAt: Date;
  }>();

  expectTypeOf(u.toHash({ only: ["name", "age"] })).toEqualTypeOf<{
    name: string | undefined;
    age: number | undefined;
  }>();

  expectTypeOf(
    u.toHash({ except: ["createdAt", "updatedAt", "email", "passwordDigest"] })
  ).toEqualTypeOf<{
    id: number;
    name: string | undefined;
    age: number | undefined;
  }>();

  const withMethods = u.toHash({ only: ["name"], methods: ["isPersisted"] });
  expectTypeOf(withMethods.name).toEqualTypeOf<string | undefined>();
  expectTypeOf(withMethods.isPersisted).toEqualTypeOf<boolean>();
});

test("toHash with include", () => {
  const u = $user.create();

  {
    const setting = u.toHash({ include: "setting" }).setting!;

    expectTypeOf(setting.threshold).toEqualTypeOf<number | undefined>();
    // @ts-expect-error
    u1.posts;

    const posts = u.toHash({ include: "posts" }).posts;
    expectTypeOf(posts[0].title).toEqualTypeOf<string>();
  }

  {
    const { setting, posts } = u.toHash({
      include: { setting: { only: ["threshold"] }, posts: { only: ["title"] } },
    });

    expectTypeOf(setting).toEqualTypeOf<
      | {
          threshold: number | undefined;
        }
      | undefined
    >();

    expectTypeOf(posts).toEqualTypeOf<
      {
        title: string;
      }[]
    >();
  }
});

test("toHash with include belongsTo", () => {
  const u = $user.create();

  {
    const user = u.setting!.toHash({ include: "user" }).user;

    expectTypeOf(user.name).toEqualTypeOf<string | undefined>();
    expectTypeOf(user.id).toEqualTypeOf<number>();
  }

  {
    const user = u.setting!.toHash({
      include: { user: { only: ["name"] } },
    }).user;

    expectTypeOf(user.name).toEqualTypeOf<string | undefined>();
    // @ts-expect-error
    user.id;
  }
});

test("toHash with only Json column", () => {
  const setting = $setting.create();

  setting.toHash({ only: ["data"] });
});
