import { Profile } from ".";
import { withI18n } from "../contexts/i18n";
import i18next from "i18next";

test("Enums options", () => {
  expect(Profile.role.values.map((v) => v.value)).toEqual(["MEMBER", "ADMIN"]);
  expect(Profile.role.values.map((v) => v.text)).toEqual(["MEMBER", "ADMIN"]);
  expect(Profile.role.options()).toEqual([
    ["MEMBER", "MEMBER"],
    ["ADMIN", "ADMIN"],
  ]);
});

describe("with i18n", () => {
  withI18n();

  test("Enums options", () => {
    expect(Profile.role.values.map((v) => v.value)).toEqual([
      "MEMBER",
      "ADMIN",
    ]);
    expect(Profile.role.values.map((v) => v.text)).toEqual([
      "メンバー",
      "管理者",
    ]);
    expect(Profile.role.options()).toEqual([
      ["メンバー", "MEMBER"],
      ["管理者", "ADMIN"],
    ]);
  });
});

describe("with model scoped i18n key", () => {
  withI18n();
  beforeEach(() => {
    i18next.addResources("ja", "translation", {
      "enums.Profile.Role.MEMBER": "Member",
      "enums.Profile.Role.ADMIN": "Admin",
    });
  });

  test("Enums options", () => {
    expect(Profile.role.options()).toEqual([
      ["Member", "MEMBER"],
      ["Admin", "ADMIN"],
    ]);
  });
});

describe("with defaults scoped i18n key", () => {
  withI18n();
  beforeEach(() => {
    i18next.addResources("ja", "translation", {
      "enums.defaults.Role.MEMBER": "Member",
      "enums.defaults.Role.ADMIN": "Admin",
    });
  });

  test("Enums options", () => {
    expect(Profile.role.options()).toEqual([
      ["Member", "MEMBER"],
      ["Admin", "ADMIN"],
    ]);
  });
});
