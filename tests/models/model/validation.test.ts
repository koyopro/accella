import { $post } from "../../factories/post";
import { $setting } from "../../factories/setting";
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
  user.validates("posts", { presence: { message: "can't be empty" } });

  expect(user.errors.fullMessages).toContain("Posts can't be empty");
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

test("validate associations", () => {
  const user = $user.build({});
  const post = $post.build({ title: "" });
  const setting = $setting.build({ threshold: -1 });
  user.setting = setting;
  user.posts = [post];

  expect(user.save()).toBe(false);
  expect(user.isValid()).toBe(false);

  expect(user.errors.fullMessages).toEqual([
    "Posts is invalid",
    "Setting is invalid",
  ]);
  expect(post.errors.fullMessages).toEqual(["Title can't be blank"]);
  expect(setting.errors.fullMessages).toEqual([
    "Threshold must be greater than or equal to 0",
  ]);
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

test("uniqueness", () => {
  const sample = $ValidateSample.create({ key: "value" });
  expect(sample.isValid()).toBe(true);

  const sample2 = $ValidateSample.build({ key: "value" });
  expect(sample2.isValid()).toBe(false);
  expect(sample2.errors.isEmpty()).toBe(false);
  expect(sample2.errors.fullMessages).toContain("Key has already been taken");

  sample2.key = "value2";

  expect(sample2.isValid()).toBe(true);
  expect(sample2.errors.isEmpty()).toBe(true);
});

test("uniqueness by scope", () => {
  $ValidateSample.create({ pattern: "abc", size: "small" });
  const sample = $ValidateSample.build({ pattern: "abc" });

  sample.size = "medium";
  sample.validates("pattern", { uniqueness: { scope: ["size"] } });
  expect(sample.errors.isEmpty()).toBe(true);

  sample.size = "small";
  sample.validates("pattern", { uniqueness: { scope: ["size"] } });
  expect(sample.errors.fullMessages).toEqual([
    "Pattern has already been taken",
  ]);
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
