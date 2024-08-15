/* eslint-disable max-lines-per-function */
import i18next from "i18next";

export const addTranslation = (key: string, value: string) => {
  i18next.addResource("ja", "translation", key, value);
};

export const withI18n = () => {
  beforeEach(async () => {
    await i18next.init({ lng: "ja" });
    const translations = {
      "accelrecord.models.User": "ユーザー",
      "accelrecord.attributes.User.name": "名前",
      "accelrecord.attributes.User.password": "パスワード",
      "accelrecord.attributes.User.passwordConfirmation": "パスワード(確認用)",
      "accelrecord.attributes.Account.password": "パスワード",
      "accelrecord.attributes.Account.passwordConfirmation":
        "パスワード(確認用)",
      "accelrecord.attributes.ValidateSample.accepted": "許可",
      "accelrecord.attributes.ValidateSample.pattern": "パターン",
      "accelrecord.attributes.ValidateSample.size": "サイズ",
      "accelrecord.attributes.ValidateSample.key": "キー",

      "errors.messages.blank": "を入力してください",
      "errors.messages.accepted": "をチェックしてください",
      "errors.messages.invalid": "は不正です",
      "errors.messages.inclusion": "はリストに含まれていません",
      "errors.messages.tooShort": "は短すぎます(%{count}文字以上)",
      "errors.messages.tooLong": "は長すぎます(%{count}文字以下)",
      "errors.messages.taken": "は既に使用されています",
      "errors.messages.confirmation": "と%{attribute}の入力が一致しません",
    };
    Object.entries(translations).forEach(([key, value]) =>
      addTranslation(key, value)
    );
  });

  afterEach(async () => {
    // reset
    await i18next.init({ resources: {} });
  });
};
