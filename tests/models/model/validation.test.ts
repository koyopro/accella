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
  expect(sample.errors.fullMessages).toContain("Accepted must be accepted");

  sample.accepted = true;

  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("presence", () => {
  const sample = $ValidateSample.build({ key: "\t \n" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.fullMessages).toContain("Key can't be blank");

  sample.key = "value";

  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("length", () => {
  const sample = $ValidateSample.build({ pattern: "a" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.fullMessages).toContain(
    "Pattern is too short (minimum is 2 characters)"
  );

  sample.pattern = "toolong";
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.fullMessages).toContain(
    "Pattern is too long (maximum is 5 characters)"
  );

  sample.pattern = "value";

  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("inclusion", () => {
  const sample = $ValidateSample.build({ size: "invalid" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.fullMessages).toContain(
    "Size is not included in the list"
  );

  sample.size = "small";

  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("format", () => {
  const sample = $ValidateSample.build({ pattern: "VALUE" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.fullMessages).toContain("Pattern is invalid");

  sample.pattern = "value";

  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("custom", () => {
  const sample = $ValidateSample.build({ key: "Value" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.fullMessages).toContain(
    "Key should start with a lowercase letter"
  );

  sample.key = "value";

  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("validatesWith", () => {
  const sample = $ValidateSample.build({ key: "xs" });
  expect(sample.isValid()).toBe(false);
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.fullMessages).toContain("Key should not be xs");

  sample.key = "value";

  expect(sample.isValid()).toBe(true);
  expect(sample.errors.isEmpty()).toBe(true);
});

test("errros", () => {
  const sample = $ValidateSample.build();
  expect(sample.errors.isEmpty()).toBe(true);
  sample.errors.add("key", "is invalid");
  expect(sample.errors.isEmpty()).toBe(false);
  expect(sample.errors.get("key").length).toBe(1);
  expect(sample.errors.get("key")[0].message).toBe("is invalid");
  expect(sample.errors.get("key")[0].fullMessage).toBe("Key is invalid");
  expect(sample.errors.fullMessages).toContain("Key is invalid");
  sample.errors.clear("key");
  expect(sample.errors.isEmpty()).toBe(true);
});
