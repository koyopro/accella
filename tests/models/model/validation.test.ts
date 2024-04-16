import { $post } from "../../factories/post";
import { $user } from "../../factories/user";
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

test("acceptance for string", () => {
  const sample = $ValidateSample.build();
  {
    sample.key = "1";
    sample.validates("key", { acceptance: true });
    expect(sample.errors.isEmpty()).toBe(true);
  }
  {
    sample.key = "yes";
    sample.validates("key", { acceptance: { accept: "yes" } });
    expect(sample.errors.isEmpty()).toBe(true);
  }
  {
    sample.key = "TRUE";
    sample.validates("key", { acceptance: { accept: ["yes", "TRUE"] } });
    expect(sample.errors.isEmpty()).toBe(true);
  }
  {
    sample.key = "yes";
    sample.validates("key", { acceptance: true });
    expect(sample.errors.isEmpty()).toBe(false);
  }
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

test("presence for hasMany", () => {
  const user = $user.create({});
  user.validates("posts", { presence: true });

  expect(user.errors.fullMessages).toContain("Posts can't be blank");
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

test("length for hasMany", () => {
  const user = $user.create({});
  user.posts = $post.buildList(5);
  user.validates("posts", { length: { maximum: 4 } });

  expect(user.errors.fullMessages).toContain(
    "Posts is too long (maximum is 4 characters)"
  );
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
  expect(sample.errors.fullMessages).toContain(
    "Pattern only allows lowercase letters"
  );

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
