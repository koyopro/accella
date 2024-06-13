import i18next from "i18next";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ pattern: "VALUE" });
    sample.validates("pattern", { format: { with: /^[a-z]+$/ } });
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Pattern is invalid"));

  describe("with i18n", () => {
    const addTranslation = (key: string, value: string) => {
      i18next.addResource("ja", "translation", key, value);
    };

    beforeEach(async () => {
      await i18next.init({ lng: "ja" });
      addTranslation(
        "accelrecord.attributes.ValidateSample.pattern",
        "パターン"
      );
    });

    afterEach(async () => {
      // reset
      await i18next.init({ resources: {} });
    });

    test("with accelrecord.errors.messages.accepted", () => {
      addTranslation("errors.messages.invalid", "は不正です");
      expect(subject()).toBe("パターン は不正です");
    });
  });
});
