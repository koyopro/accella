import { User } from "./index";

test("select", () => {
  const users = User.select("name", "email").select("id").toArray();
  expectTypeOf(users).toMatchTypeOf<{ name: string | undefined; email: string; id: number }[]>();
});

test("joins", () => {
  const users = User.joins("posts").toArray();
  expectTypeOf(users).toMatchTypeOf<User[]>();
});
