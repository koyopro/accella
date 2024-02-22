import { $setting } from "../factories/setting";
import { $user } from "../factories/user";
import { Setting } from "./setting";

describe("Setting", () => {
  test(".associations()", () => {
    expect(Setting.assosiations.user).toEqual({
      klass: "User",
      foreignKey: "",
      primaryKey: "",
      table: "user",
      field: expect.anything(),
    });
  });

  test(".create()", () => {
    const user = $user.create();
    $setting.create({ threshold: 0.5, userId: user.id });
    expect(Setting.count()).toBe(1);
    expect(Setting.findBy({ userId: user.id })?.threshold).toBeCloseTo(0.5);
  });
});
