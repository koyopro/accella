import { withI18n } from "../../contexts/i18n";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ accepted: false });
    sample.isValid();
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Accepted must be accepted"));

  describe("with i18n", () => {
    withI18n();

    test("should be translated", () => {
      expect(subject()).toBe("許可 をチェックしてください");
    });
  });
});
