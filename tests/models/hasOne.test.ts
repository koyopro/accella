import { $setting } from "../factories/setting";
import { $user } from "../factories/user";
import { Setting } from "./setting";
import { User } from "./user";

describe("hasOne", () => {
  test.skip(".associations()", () => {
    expect(Setting.associations.user).toEqual({
      klass: "User",
      foreignKey: "userId",
      primaryKey: "id",
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

  test("hasOne get", () => {
    const user = $user.create();
    const setting = $setting.create({ userId: user.id });
    expect(user.setting?.settingId).toEqual(setting.settingId);
  });

  test("hasOne set", () => {
    expect(Setting.count()).toBe(0);
    const user = $user.create();
    user.setting = $setting.build({ threshold: 0.5 });
    expect(Setting.count()).toBe(1);
    expect(User.find(user.id).setting?.threshold).toBeCloseTo(0.5);
  });

  test("set in build", () => {
    expect(Setting.count()).toBe(0);
    const user = $user.create({ setting: $setting.build({ threshold: 0.5 }) });
    expect(Setting.count()).toBe(1);
    expect(user.setting?.threshold).toBeCloseTo(0.5);
  });

  test("set in update", () => {
    expect(Setting.count()).toBe(0);
    const user = $user.create();
    user.update({ setting: $setting.build({ threshold: 0.5 }) });
    expect(Setting.count()).toBe(1);
    expect(user.setting?.threshold).toBeCloseTo(0.5);
  });

  test("set to null", () => {
    const user = $user.create({ setting: $setting.build({ threshold: 0.5 }) });
    expect(Setting.count()).toBe(1);
    user.setting = undefined;
    expect(Setting.count()).toBe(0);
  });

  test("includes", () => {
    $setting.create({ user: $user.create() });
    $setting.create({ user: $user.create() });
    // Confirm: that N+1 queries are not occurring
    const users = User.includes(["setting"]).toArray();
    expect(users[0]?.setting?.isNewRecord).toBe(false);
    expect(users[1]?.setting?.isNewRecord).toBe(false);
  });
});
