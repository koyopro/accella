import { $ValidateSample } from "../../factories/validateSample";

test("isValid()", () => {
  const sample = $ValidateSample.build();
  expect(sample.isValid()).toBe(true);
  expect(sample.isInvalid()).toBe(false);
  expect(sample.errors).not.toBeUndefined();
  expect(sample.errors.isEmpty()).toBe(true);
  sample.validate();
});

test("acceptence", () => {
  const sample = $ValidateSample.build({ accepted: false });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.get("accepted")).toEqual(["must be accepted"]);

  sample.accepted = true;

  sample.validate();
  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("presence", () => {
  const sample = $ValidateSample.build({ key: "\t \n" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.get("key")).toEqual(["can't be blank"]);

  sample.key = "value";

  sample.validate();
  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("length", () => {
  const sample = $ValidateSample.build({ pattern: "a" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.get("pattern")).toEqual([
    "is too short (minimum is 2 characters)",
  ]);

  sample.pattern = "too long";
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.get("pattern")).toEqual([
    "is too long (maximum is 5 characters)",
  ]);

  sample.pattern = "value";

  sample.validate();
  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});
