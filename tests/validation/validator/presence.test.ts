import i18next from "i18next";
import { User } from "../../models";

describe("error message", () => {
  const subject = () => {
    const user = User.build({});
    user.validates("name", { presence: true });
    return user.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Name can't be blank"));

  describe("with i18n", () => {
    const addTranslation = (key: string, value: string) => {
      i18next.addResource("ja", "translation", key, value);
    };

    beforeEach(async () => {
      await i18next.init({ lng: "ja" });
      addTranslation("accelrecord.attributes.User.name", "名前");
    });

    afterEach(async () => {
      // reset
      await i18next.init({ resources: {} });
    });

    test("with accelrecord.errors.messages.blank", () => {
      addTranslation("accelrecord.errors.messages.blank", "を入力してください");
      expect(subject()).toBe("名前 を入力してください");
    });

    test("with accelrecord.errors.models.User.blank", () => {
      addTranslation(
        "accelrecord.errors.models.User.blank",
        "を入力してください"
      );
      expect(subject()).toBe("名前 を入力してください");
    });

    test("with accelrecord.errors.models.User.attributes.name.blank", () => {
      addTranslation(
        "accelrecord.errors.models.User.attributes.name.blank",
        "を入力してください"
      );
      expect(subject()).toBe("名前 を入力してください");
    });

    test("with errors.attributes.name.blank", () => {
      addTranslation("errors.attributes.name.blank", "を入力してください");
      expect(subject()).toBe("名前 を入力してください");
    });

    test("with errors.messages.blank", () => {
      addTranslation("errors.messages.blank", "を入力してください");
      expect(subject()).toBe("名前 を入力してください");
    });
  });
});
