import { withI18n } from "../../contexts/i18n";
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
    withI18n();

    test("should be translated", () => {
      expect(subject()).toEqual([
        "パターン は短すぎます(2文字以上)",
        "キー は長すぎます(5文字以下)",
      ]);
    });
  });
});
