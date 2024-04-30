import { $user } from "../../factories/user.js";
import { $ValidateSample } from "../../factories/validateSample.js";
import { User, ValidateSample } from "../index.js";

test(".import", () => {
  const users = [
    $user.build({ email: "foo@example.com" }),
    $user.build({ email: "bar@example.com" }),
  ];
  User.import(users);
  expect(User.count()).toBe(2);
});

test(".import with validation error", () => {
  const records = [
    $ValidateSample.build({}), // valid
    $ValidateSample.build({ key: "xs" }), // invalid
  ];
  ValidateSample.import(records);
  expect(ValidateSample.count()).toBe(1);
});

test(".import without validation", () => {
  const records = [
    $ValidateSample.build({}), // valid
    $ValidateSample.build({ key: "xs" }), // invalid
  ];
  ValidateSample.import(records, { validate: false });
  expect(ValidateSample.count()).toBe(2);
});

test(".import with thrown validation error", () => {
  const records = [
    $ValidateSample.build({}), // valid
    $ValidateSample.build({ key: "xs" }), // invalid
  ];
  expect(() => ValidateSample.import(records, { validate: "throw" })).toThrow();
});
