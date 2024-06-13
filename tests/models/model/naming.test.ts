import { Setting, User } from "..";
import { withI18n } from "../../contexts/i18n";

test("modelName.human", () => {
  expect(User.modelName.human).toBe("User");
  expect(Setting.modelName.human).toBe("Setting");
});

test("humanAttributeName", () => {
  expect(User.humanAttributeName("name")).toBe("Name");
  expect(Setting.humanAttributeName("user")).toBe("User");
});

describe("with i18n", () => {
  withI18n();

  test("modelName.human", () => {
    expect(User.modelName.human).toBe("ユーザー");
    expect(Setting.modelName.human).toBe("Setting");
  });

  test("humanAttributeName", () => {
    expect(User.humanAttributeName("name")).toBe("名前");
    expect(Setting.humanAttributeName("user")).toBe("User");
  });

  test("error message", () => {
    const user = User.build({});
    user.validates("name", { presence: true });

    expect(user.errors.fullMessages).toContain("名前 を入力してください");
  });
});
