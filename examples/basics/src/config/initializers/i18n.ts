import { loadLocaleResources } from "accella/locales";
import i18next from "i18next";

export default async () => {
  const resources = await loadLocaleResources();
  await i18next.init({ lng: "en", resources });
};
