import { withI18n } from "../../contexts/i18n";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ size: "invalid" });
    sample.isValid();
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Size is not included in the list"));

  describe("with i18n", () => {
    withI18n();

    test("should be translated", () => {
      expect(subject()).toBe("サイズ はリストに含まれていません");
    });
  });
});
