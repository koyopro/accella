import { t } from "i18next";
import initI18n from "src/config/initializers/i18n";

test("loadLocaleResources", async () => {
  await initI18n();
  expect(t("accelrecord.models.User")).toBe("User");
  expect(t("accelrecord.models.Account")).toBe("Account");
  expect(t("accelrecord.models.Setting")).toBe("Setting");
  expect(t("accelrecord.models.Profile")).toBe("Profile");
  expect(t("accelrecord.models.Company")).toBe("Company");
});
