import { I18n } from "accel-record/i18n";
import { withI18n } from "../contexts/i18n";

withI18n();

test("I18n", () => {
  expect(I18n.t("accelrecord.models.User")).toBe("ユーザー");
  expect(I18n.t("missing")).toBe("missing");
  expect(I18n.t("missing", undefined)).toBe("missing");
  expect(I18n.t("missing", "")).toBe("");
  expect(I18n.t("missing", "my default")).toBe("my default");
});
