import i18next from "i18next";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ accepted: false });
    sample.isValid();
    return sample.errors.fullMessages[0];
  };

  test("default", () => expect(subject()).toBe("Accepted must be accepted"));

  describe("with i18n", () => {
    const addTranslation = (key: string, value: string) => {
      i18next.addResource("ja", "translation", key, value);
    };

    beforeEach(async () => {
      await i18next.init({ lng: "ja" });
      addTranslation("accelrecord.attributes.ValidateSample.accepted", "許可");
    });

    afterEach(async () => {
      // reset
      await i18next.init({ resources: {} });
    });

    test("with accelrecord.errors.messages.accepted", () => {
      addTranslation("errors.messages.accepted", "をチェックしてください");
      expect(subject()).toBe("許可 をチェックしてください");
    });
  });
});
