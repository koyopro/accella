import i18next from "i18next";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ size: "invalid" });
    sample.isValid();
    return sample.errors.fullMessages[0];
  };

  test("default", () =>
    expect(subject()).toBe("Size is not included in the list"));

  describe("with errors.messages.inclusion", () => {
    beforeEach(async () => {
      await setupI18n({
        errors: {
          messages: {
            inclusion: "はリストに含まれていません",
          },
        },
      });
    });
    test("should be translated", () =>
      expect(subject()).toBe("サイズ はリストに含まれていません"));
  });

  const setupI18n = async (config: any) => {
    config["accelrecord"] ||= {};
    config.accelrecord.attributes = {
      ValidateSample: {
        size: "サイズ",
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
