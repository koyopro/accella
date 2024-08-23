import { User } from "./index";

test("select", () => {
  const users = User.all().select("name", "email").select("id").toArray();
  expectTypeOf(users).toMatchTypeOf<{ name: string | undefined; email: string; id: number }[]>();
});

test("generator", () => {
  for (const user of User.all()) {
    expectTypeOf(user).toMatchTypeOf<User>();
  }
});

test("joins", () => {
  User.joins("posts", "setting");
  User.joins({ posts: "tags" });
  User.joins({ posts: ["tags", "author"] });
  User.joins({ posts: { author: ["setting", "teams"] } });
  // @ts-expect-error
  User.joins("posts", "invalid");
  // @ts-expect-error
  User.joins({ posts: "invalid" });

  User.all().joins("posts", "setting");
  User.all().joins({ posts: "tags" });
  User.all().joins({ posts: ["tags", "author"] });
  User.all().joins({ posts: { author: ["setting", "teams"] } });
  // @ts-expect-error
  User.all().joins("posts", "invalid");
  // @ts-expect-error
  User.all().joins({ posts: "invalid" });
});
