import i18next from "i18next";

export const addTranslation = (key: string, value: string) => {
  i18next.addResource("ja", "translation", key, value);
};

export const withI18n = () => {
  beforeAll(async () => {
    await i18next.init({ lng: "ja" });
    addTranslation("accelrecord.models.User", "ユーザー");
    addTranslation("accelrecord.attributes.User.name", "名前");
    addTranslation("accelrecord.attributes.ValidateSample.accepted", "許可");
    addTranslation("accelrecord.attributes.ValidateSample.pattern", "パターン");
    addTranslation("accelrecord.attributes.ValidateSample.size", "サイズ");
    addTranslation("accelrecord.attributes.ValidateSample.key", "キー");
  });

  afterAll(async () => {
    // reset
    await i18next.init({ resources: {} });
  });
};
