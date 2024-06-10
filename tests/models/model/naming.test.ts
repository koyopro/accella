import i18next from "i18next";
import { Setting, User } from "..";

test("modelName.human", async () => {
  expect(User.modelName.human).toBe("User");
  expect(Setting.modelName.human).toBe("Setting");
});

test("modelName.human with i18n", async () => {
  await i18next.init({
    lng: "ja",
    resources: {
      ja: {
        translation: {
          accelrecord: {
            models: {
              user: "ユーザー",
            },
          },
        },
      },
    },
  });
  expect(User.modelName.human).toBe("ユーザー");
  expect(Setting.modelName.human).toBe("Setting");
});

test("human_attribute_name", async () => {
  expect(User.humanAttributeName("name")).toBe("Name");
  expect(Setting.humanAttributeName("user")).toBe("User");
});

test("human_attribute_name with i18n", async () => {
  await i18next.init({
    lng: "ja",
    resources: {
      ja: {
        translation: {
          accelrecord: {
            attributes: {
              user: {
                name: "名前",
              },
            },
          },
        },
      },
    },
  });
  expect(User.humanAttributeName("name")).toBe("名前");
  expect(Setting.humanAttributeName("user")).toBe("User");
});
