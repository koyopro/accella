import i18next from "i18next";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ pattern: "VALUE" });
    sample.validates("pattern", { format: { with: /^[a-z]+$/ } });
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Pattern is invalid"));

  describe("with errors.messages.accepted", () => {
    beforeEach(async () => {
      await setupI18n({
        errors: {
          messages: {
            invalid: "は不正です",
          },
        },
      });
    });
    test("should be translated", () =>
      expect(subject()).toBe("パターン は不正です"));
  });

  const setupI18n = async (config: any) => {
    config["accelrecord"] ||= {};
    config.accelrecord.attributes = {
      ValidateSample: {
        pattern: "パターン",
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
