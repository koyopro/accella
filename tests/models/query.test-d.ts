import { User } from "./index";

test("select", () => {
  const users = User.select("name", "email").select("id").toArray();
  expectTypeOf(users).toMatchTypeOf<
    { name: string | undefined; email: string; id: number }[]
  >();
});
