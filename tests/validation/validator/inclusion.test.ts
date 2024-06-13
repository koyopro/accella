import i18next from "i18next";
import { $ValidateSample } from "../../factories/validateSample";

describe("error message", () => {
  const subject = () => {
    const sample = $ValidateSample.build({ size: "invalid" });
    sample.isValid();
    return sample.errors.fullMessages[0];
  };

  test("default", () =>
    expect(subject()).toBe("Size is not included in the list"));

  describe("with i18n", () => {
    const addTranslation = (key: string, value: string) => {
      i18next.addResource("ja", "translation", key, value);
    };

    beforeEach(async () => {
      await i18next.init({ lng: "ja" });
      addTranslation("accelrecord.attributes.ValidateSample.size", "サイズ");
    });

    afterEach(async () => {
      // reset
      await i18next.init({ resources: {} });
    });

    test("with accelrecord.errors.messages.accepted", () => {
      addTranslation("errors.messages.inclusion", "はリストに含まれていません");
      expect(subject()).toBe("サイズ はリストに含まれていません");
    });
  });
});
