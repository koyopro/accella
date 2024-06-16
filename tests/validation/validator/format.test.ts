import { withI18n } from "../../contexts/i18n";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ pattern: "VALUE" });
    sample.validates("pattern", { format: { with: /^[a-z]+$/ } });
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Pattern is invalid"));

  describe("with i18n", () => {
    withI18n();

    test("should be translated", () => {
      expect(subject()).toBe("パターン は不正です");
    });
  });
});
