import i18next from "i18next";
import { Profile } from ".";
import { withI18n } from "../contexts/i18n";
import { $Profile } from "../factories/profile";
import { dbConfig } from "../vitest.setup";

describe("Enums", (context: any) => {
  if (dbConfig().type == "sqlite") return context.skip();

  test("Enums options", () => {
    expect(Profile.role.values().map((v) => v.value)).toEqual([
      "MEMBER",
      "ADMIN",
    ]);
    expect(Profile.role.values().map((v) => v.text)).toEqual([
      "MEMBER",
      "ADMIN",
    ]);
    expect(Profile.role.options()).toEqual([
      ["MEMBER", "MEMBER"],
      ["ADMIN", "ADMIN"],
    ]);
  });

  test("enum text", () => {
    const profile = $Profile.build({ role: "MEMBER" });
    expect(profile.role).toBe("MEMBER");
    expect(profile.roleText).toBe("MEMBER");
  });

  describe("with i18n", () => {
    withI18n();

    test("Enums options", () => {
      expect(Profile.role.values().map((v) => v.value)).toEqual([
        "MEMBER",
        "ADMIN",
      ]);
      expect(Profile.role.values().map((v) => v.text)).toEqual([
        "メンバー",
        "管理者",
      ]);
      expect(Profile.role.options()).toEqual([
        ["メンバー", "MEMBER"],
        ["管理者", "ADMIN"],
      ]);
    });

    test("enum text", () => {
      expect($Profile.build({ role: "MEMBER" }).roleText).toBe("メンバー");
      expect($Profile.build({ role: "ADMIN" }).roleText).toBe("管理者");
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

    test("enum text", () => {
      expect($Profile.build({ role: "MEMBER" }).roleText).toBe("Member");
      expect($Profile.build({ role: "ADMIN" }).roleText).toBe("Admin");
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

    test("enum text", () => {
      expect($Profile.build({ role: "MEMBER" }).roleText).toBe("Member");
      expect($Profile.build({ role: "ADMIN" }).roleText).toBe("Admin");
    });
  });
});
