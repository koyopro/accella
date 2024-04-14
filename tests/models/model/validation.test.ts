import { ValidateSample } from "..";

test("isValid()", () => {
  const sample = ValidateSample.build({});
  expect(sample.isValid()).toBe(true);
  expect(sample.isInvalid()).toBe(false);
  expect(sample.errors).not.toBeUndefined();
  expect(sample.errors.isEmpty()).toBe(true);
  sample.validate();
});
