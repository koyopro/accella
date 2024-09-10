import { BooleanType } from "accel-record/attributes";
import { $setting } from "../../factories/setting";

test("BooleanType#cast()", () => {
  const boolean = new BooleanType(true);
  expect(boolean.cast(undefined)).toBeUndefined();
  expect(boolean.cast(null)).toBeUndefined();
  expect(boolean.cast("")).toBeUndefined();

  expect(boolean.cast(false)).toBeFalsy();
  expect(boolean.cast(0)).toBeFalsy();
  expect(boolean.cast("0")).toBeFalsy();
  expect(boolean.cast("f")).toBeFalsy();
  expect(boolean.cast("F")).toBeFalsy();
  expect(boolean.cast("false")).toBeFalsy();
  expect(boolean.cast("FALSE")).toBeFalsy();
  expect(boolean.cast("off")).toBeFalsy();
  expect(boolean.cast("OFF")).toBeFalsy();

  expect(boolean.cast(true)).toBeTruthy();
  expect(boolean.cast(1)).toBeTruthy();
  expect(boolean.cast("1")).toBeTruthy();
  expect(boolean.cast("t")).toBeTruthy();
  expect(boolean.cast("T")).toBeTruthy();
  expect(boolean.cast("true")).toBeTruthy();
  expect(boolean.cast("TRUE")).toBeTruthy();
  expect(boolean.cast("on")).toBeTruthy();
  expect(boolean.cast("ON")).toBeTruthy();
  expect(boolean.cast("abc")).toBeTruthy();
});

test("attributes", () => {
  const setting = $setting.build();
  expect(setting.counter).toBe(0);
  setting.counter = 1.1;
  expect(setting.counter).toBe(1);
  setting.counter = "2.8" as any;
  expect(setting.counter).toBe(2);
  setting.counter = "" as any;
  expect(setting.counter).toBeUndefined();
});
