import { initAccelRecord } from "accel-record";
import { Helper } from "accel-web";
import { defineMiddleware } from "astro/middleware";
import i18next from "i18next";

export const onRequest = defineMiddleware(async (context, next) => {
  await i18next.init({
    lng: "ja",
    resources: {
      ja: {
        translation: {
          "accelrecord.attributes.Account.email": "メールアドレス",
          "accelrecord.attributes.Account.password": "パスワード",
          "accelrecord.attributes.Account.passwordConfirmation":
            "パスワード(確認用)",

          "errors.messages.blank": "を入力してください",
          "errors.messages.accepted": "をチェックしてください",
          "errors.messages.invalid": "は不正です",
          "errors.messages.inclusion": "はリストに含まれていません",
          "errors.messages.tooShort": "は短すぎます(%{count}文字以上)",
          "errors.messages.tooLong": "は長すぎます(%{count}文字以下)",
          "errors.messages.taken": "は既に使用されています",
          "errors.messages.confirmation": "と%{attribute}の入力が一致しません",
        },
      },
    },
  });
  await initAccelRecord({
    type: "mysql",
    datasourceUrl: process.env.DATABASE_URL,
  });
  context.locals.helper = await Helper.init(context);
  return next();
});
