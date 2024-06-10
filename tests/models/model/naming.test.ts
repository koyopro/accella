import i18next from "i18next";
import { Setting, User } from "..";

test("modelName.human", () => {
  expect(User.modelName.human).toBe("User");
  expect(Setting.modelName.human).toBe("Setting");
});

test("humanAttributeName", () => {
  expect(User.humanAttributeName("name")).toBe("Name");
  expect(Setting.humanAttributeName("user")).toBe("User");
});

describe("with i18n", () => {
  beforeAll(async () => {
    await i18next.init({
      lng: "ja",
      resources: {
        ja: {
          translation: {
            accelrecord: {
              models: {
                user: "ユーザー",
              },
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
  });

  afterAll(async () => {
    // reset
    await i18next.init({ resources: {} });
  });

  test("modelName.human", () => {
    expect(User.modelName.human).toBe("ユーザー");
    expect(Setting.modelName.human).toBe("Setting");
  });

  test("humanAttributeName", () => {
    expect(User.humanAttributeName("name")).toBe("名前");
    expect(Setting.humanAttributeName("user")).toBe("User");
  });
});
