import { User } from "./index";

test("select", () => {
  const users = User.all().select("name", "email").select("id").toArray();
  expectTypeOf(users).toMatchTypeOf<
    { name: string | undefined; email: string; id: number }[]
  >();
});

test("generator", () => {
  for (const user of User.all()) {
    expectTypeOf(user).toMatchTypeOf<User>();
  }
});
