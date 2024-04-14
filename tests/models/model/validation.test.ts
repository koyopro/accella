import { ValidateSample } from "..";

test("isValid()", () => {
  const sample = ValidateSample.build({ accepted: true });
  expect(sample.isValid()).toBe(true);
  expect(sample.isInvalid()).toBe(false);
  expect(sample.errors).not.toBeUndefined();
  expect(sample.errors.isEmpty()).toBe(true);
  sample.validate();
});

test("acceptence", () => {
  const sample = ValidateSample.build({ accepted: false });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.get("accepted")).toEqual(["must be accepted"]);

  sample.accepted = true;

  sample.validate();
  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});
