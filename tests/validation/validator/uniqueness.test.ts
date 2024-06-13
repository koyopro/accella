import { withI18n } from "../../contexts/i18n";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    $ValidateSample.create({ key: "value" });

    const sample = $ValidateSample.build({ key: "value" });
    sample.isValid();
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Key has already been taken"));

  describe("with i18n", () => {
    withI18n();

    test("should be translated", () => {
      expect(subject()).toBe("キー は既に使用されています");
    });
  });
});
