import { type NewSetting, type NewUser, Setting, User } from ".";
import { $setting } from "../factories/setting";
import { $user } from "../factories/user";

describe("getter/setter types", () => {
  test("new & new", () => {
    const setting = $setting.build();
    expectTypeOf(setting).toMatchTypeOf<NewSetting>();

    const user = $user.build();
    expectTypeOf(user).toMatchTypeOf<NewUser>();

    // @ts-expect-error
    assertType((setting.user = user));
  });

  test("new & persisted", () => {
    const setting = $setting.build();
    expectTypeOf(setting).toMatchTypeOf<NewSetting>();

    const user = $user.create();
    expectTypeOf(user).toMatchTypeOf<User>();

    expectTypeOf(setting.user).toMatchTypeOf<User | undefined>();
    assertType((setting.user = user));
  });

  test("persisted & new", () => {
    const setting = $setting.create();
    expectTypeOf(setting).toMatchTypeOf<Setting>();

    const user = $user.build();
    expectTypeOf(user).toMatchTypeOf<NewUser>();

    expectTypeOf(setting.user).toMatchTypeOf<User>();
    // @ts-expect-error
    assertType((setting.user = user));
  });

  test("persisted & persisted", () => {
    const setting = $setting.create();
    expectTypeOf(setting).toMatchTypeOf<Setting>();

    const user = $user.create();
    expectTypeOf(user).toMatchTypeOf<User>();

    expectTypeOf(setting.user).toMatchTypeOf<User>();
    assertType((setting.user = user));
  });
});
