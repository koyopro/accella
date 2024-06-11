import i18next from "i18next";
import { User } from "../../models";

describe("error message", () => {
  const subject = () => {
    const user = User.build({});
    user.validates("name", { presence: true });
    return user.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Name can't be blank"));

  describe("with accelrecord.errors.messages.blank", () => {
    beforeEach(async () => {
      await setupI18n({
        accelrecord: { errors: { messages: { blank: "を入力してください" } } },
      });
    });
    test("case 1", () => expect(subject()).toBe("名前 を入力してください"));
  });

  describe("with accelrecord.errors.models.User.blank", () => {
    beforeEach(async () => {
      await setupI18n({
        accelrecord: {
          errors: { models: { User: { blank: "を入力してください" } } },
        },
      });
    });
    test("case 2", () => expect(subject()).toBe("名前 を入力してください"));
  });

  describe("with accelrecord.errors.models.User.attributes.name.blank", () => {
    beforeEach(async () => {
      await setupI18n({
        accelrecord: {
          errors: {
            models: {
              User: { attributes: { name: { blank: "を入力してください" } } },
            },
          },
        },
      });
    });
    test("case 3", () => expect(subject()).toBe("名前 を入力してください"));
  });

  describe("with errors.attributes.name.blank", () => {
    beforeEach(async () => {
      await setupI18n({
        errors: {
          attributes: {
            name: { blank: "を入力してください" },
          },
        },
      });
    });
    test("case 4", () => expect(subject()).toBe("名前 を入力してください"));
  });

  describe("with errors.messages.blank", () => {
    beforeEach(async () => {
      await setupI18n({
        errors: {
          messages: {
            blank: "を入力してください",
          },
        },
      });
    });
    test("case 5", () => expect(subject()).toBe("名前 を入力してください"));
  });

  const setupI18n = async (config: any) => {
    config["accelrecord"] ||= {};
    config.accelrecord.attributes = {
      user: {
        name: "名前",
      },
    };
    await i18next.init({
      lng: "ja",
      resources: {
        ja: {
          translation: config,
        },
      },
    });
  };

  afterEach(async () => {
    // reset
    await i18next.init({ resources: {} });
  });
});
