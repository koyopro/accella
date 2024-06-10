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
