import { Setting, User } from ".";
import { $setting } from "../factories/setting";
import { $user } from "../factories/user";

describe("hasOne", () => {
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

  test("hasOne set with validation error", () => {
    expect(Setting.count()).toBe(0);
    const user = $user.create();
    const setting = $setting.build({ threshold: -1 });
    user.setting = setting;
    expect(setting.isValid()).toBe(false);
    expect(Setting.count()).toBe(0);
    expect(User.find(user.id).setting).toBeUndefined();
    expect(user.setting).toBeUndefined();
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

  test("set to other", () => {
    const user = $user.create({ setting: $setting.build({ threshold: 0.5 }) });
    expect(Setting.count()).toBe(1);

    {
      const settingId = user.setting!.settingId;
      user.setting = $setting.build({ threshold: 1.0 });

      // Old setting should be deleted
      expect(Setting.count()).toBe(1);
      expect(Setting.findBy({ settingId })).toBeUndefined();
      expect(user.setting?.settingId).not.toEqual(settingId);
    }
    {
      // with Validation Error, should not be replace
      const settingId = user.setting?.settingId;
      const setting = $setting.build({ threshold: -1 });
      user.setting = setting;

      expect(Setting.findBy({ settingId })!.equals(user.setting!)).toBeTruthy();
      expect(user.setting?.settingId).toEqual(settingId);
    }
  });

  test("includes", () => {
    $setting.create({ user: $user.create() });
    $setting.create({ user: $user.create() });

    const users = User.all().includes("setting").toArray();
    const beforeCount = User.connection.queryCount;
    expect(users[0]?.setting?.isNewRecord).toBe(false);
    expect(users[1]?.setting?.isNewRecord).toBe(false);
    expect(User.connection.queryCount).toBe(beforeCount);
  });

  test("build association", () => {
    const user = $user.create();
    const setting = user.build("setting", { threshold: 0.5 });
    expect(setting.userId).toBe(user.id);
    expect(setting.threshold).toBeCloseTo(0.5);
  });

  test("create association", () => {
    const user = $user.create();
    const profile = user.create("Profile", { bio: "Hello" });
    expect(profile.isPersisted()).toBe(true);
    expect(profile.userId).toBe(user.id);
    expect(profile.bio).toBe("Hello");
  });

  describe("getter/setter types", () => {
    test("persisted & new", () => {
      const user = $user.create();
      const setting = $setting.build();
      expect(setting.isPersisted()).toBe(false);
      user.setting = setting;
      expect(setting.isPersisted()).toBe(true);
      expect(user.setting?.isPersisted()).toBe(true);
    });

    test("new & new", () => {
      const user = $user.build();
      const setting = $setting.build();
      user.setting = setting;
      expect(user.isPersisted()).toBe(false);
      expect(setting.isPersisted()).toBe(false);

      if (!user.save()) throw new Error("Failed to save user");
      expect(user.isPersisted()).toBe(true);
      expect(setting.isPersisted()).toBe(true);
      expect(user.setting?.isPersisted()).toBe(true);
    });
  });
});
