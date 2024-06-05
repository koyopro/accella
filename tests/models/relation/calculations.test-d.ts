import { User } from "../_types";

test("#pluck()", () => {
  expectTypeOf(User.all().pluck("id")).toMatchTypeOf<number[]>();
  expectTypeOf(User.all().pluck("name")).toMatchTypeOf<
    (string | undefined)[]
  >();
});
