import { $setting } from "../../factories/setting";
import { User } from "../_types";

test("updateAll", () => {
  User.where({ name: "bar" }).updateAll({ name: "baz", age: undefined });

  // @ts-expect-error
  User.where({ name: "bar" }).updateAll({ setting: $setting.create() });
});
