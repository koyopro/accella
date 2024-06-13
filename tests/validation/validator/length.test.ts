import i18next from "i18next";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ pattern: "a", key: "1234567890" });
    sample.validates("pattern", { length: { minimum: 2 } });
    sample.validates("key", { length: { maximum: 5 } });
    return sample.errors.fullMessages;
  };

  test("default", () =>
    expect(subject()).toEqual([
      "Pattern is too short (minimum is 2 characters)",
      "Key is too long (maximum is 5 characters)",
    ]));

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
      addTranslation("accelrecord.attributes.ValidateSample.key", "キー");
    });

    afterEach(async () => {
      // reset
      await i18next.init({ resources: {} });
    });

    test("with accelrecord.errors.messages.tooShort", () => {
      addTranslation(
        "errors.messages.tooShort",
        "は短すぎます(%{count}文字以上)"
      );
      addTranslation(
        "errors.messages.tooLong",
        "は長すぎます(%{count}文字以下)"
      );
      expect(subject()).toEqual([
        "パターン は短すぎます(2文字以上)",
        "キー は長すぎます(5文字以下)",
      ]);
    });
  });
});
