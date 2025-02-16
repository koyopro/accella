import { loadLocaleResources } from "accella/locales";
import i18next from "i18next";

export default async () => {
  // return;
  const resources = await loadLocaleResources();
  await i18next.init({ lng: "ja", resources });
  // await i18next.changeLanguage("en");
};
