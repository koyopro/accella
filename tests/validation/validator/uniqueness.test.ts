import i18next from "i18next";
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
    const addTranslation = (key: string, value: string) => {
      i18next.addResource("ja", "translation", key, value);
    };

    beforeEach(async () => {
      await i18next.init({ lng: "ja" });
      addTranslation("accelrecord.attributes.ValidateSample.key", "キー");
    });

    afterEach(async () => {
      // reset
      await i18next.init({ resources: {} });
    });

    test("with errors.messages.taken", () => {
      addTranslation("errors.messages.taken", "は既に使用されています");
      expect(subject()).toBe("キー は既に使用されています");
    });
  });
});
