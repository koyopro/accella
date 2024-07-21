import { initAccelRecord } from "accel-record";
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
        },
      },
    },
  });
  await initAccelRecord({
    type: "mysql",
    datasourceUrl: process.env.DATABASE_URL,
  });
  return next();
});
