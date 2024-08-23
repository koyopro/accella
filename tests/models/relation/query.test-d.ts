import { $setting } from "../../factories/setting";
import { User } from "../_types";

test("updateAll", () => {
  User.where({ name: "bar" }).updateAll({ name: "baz", age: undefined });

  // @ts-expect-error
  User.where({ name: "bar" }).updateAll({ setting: $setting.create() });
});

test("#pluck()", () => {
  expectTypeOf(User.all().pluck("id")).toMatchTypeOf<number[]>();
  expectTypeOf(User.all().pluck("name")).toMatchTypeOf<(string | undefined)[]>();
});
