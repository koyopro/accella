import i18next from "i18next";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ accepted: false });
    sample.isValid();
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Accepted must be accepted"));

  describe("with errors.messages.accepted", () => {
    beforeEach(async () => {
      await setupI18n({
        errors: {
          messages: {
            accepted: "をチェックしてください",
          },
        },
      });
    });
    test("should be translated", () =>
      expect(subject()).toBe("許可 をチェックしてください"));
  });

  const setupI18n = async (config: any) => {
    config["accelrecord"] ||= {};
    config.accelrecord.attributes = {
      ValidateSample: {
        accepted: "許可",
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
