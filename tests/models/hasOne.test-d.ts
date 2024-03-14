import { NewSetting, NewUser, Setting, User } from ".";
import { $setting } from "../factories/setting";
import { $user } from "../factories/user";
import { SettingModel } from "./setting";

describe("getter/setter types", () => {
  test("new & new", () => {
    const user = $user.build();
    expectTypeOf(user).toMatchTypeOf<NewUser>();

    const setting = $setting.build();
    expectTypeOf(setting).toMatchTypeOf<NewSetting>();

    expectTypeOf(user.setting).toMatchTypeOf<SettingModel | undefined>();
    assertType((user.setting = setting));
    expectTypeOf(user.setting).toMatchTypeOf<SettingModel>();
  });

  test("new & persisted", () => {
    const user = $user.build();
    expectTypeOf(user).toMatchTypeOf<NewUser>();

    const setting = $setting.create();
    expectTypeOf(setting).toMatchTypeOf<Setting>();

    expectTypeOf(user.setting).toMatchTypeOf<SettingModel | undefined>();
    assertType((user.setting = setting));
    expectTypeOf(user.setting).toMatchTypeOf<SettingModel>();
  });

  test("persisted & new", () => {
    const user = $user.create();
    expectTypeOf(user).toMatchTypeOf<User>();

    const setting = $setting.build();
    expectTypeOf(setting).toMatchTypeOf<NewSetting>();

    expectTypeOf(user.setting).toMatchTypeOf<Setting | undefined>();
    assertType((user.setting = setting));
    expectTypeOf(user.setting).toMatchTypeOf<Setting | undefined>();
  });

  test("persisted & persisted", () => {
    const user = $user.create();
    expectTypeOf(user).toMatchTypeOf<User>();

    const setting = $setting.create();
    expectTypeOf(setting).toMatchTypeOf<Setting>();

    expectTypeOf(user.setting).toMatchTypeOf<Setting | undefined>();
    assertType((user.setting = setting));
    expectTypeOf(user.setting).toMatchTypeOf<Setting>();
  });
});
