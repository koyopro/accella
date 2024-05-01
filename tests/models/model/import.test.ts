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

test(".import with Array of Hash", () => {
  const users = [{ email: "foo@example.com" }, { email: "bar@example.com" }];
  User.import(users);
  expect(User.count()).toBe(2);
  expect(User.first()?.email).toBe("foo@example.com");
});

test(".import with onDuplicateKeyUpdate", () => {
  const user = $user.create({ email: "foo@example.com", name: "foo", age: 10 });
  const users = [
    $user.build({ email: "foo@example.com", name: "foo2", age: 20 }), // conflict
    $user.build({ email: "bar@example.com", name: "bar", age: 30 }), // new
  ];
  expect(() => User.import(users)).toThrow();

  User.import(users, { onDuplicateKeyUpdate: ["name"] });
  user.reload();
  expect(user.name).toBe("foo2"); // should be updated
  expect(user.age).toBe(10); // should not be updated

  User.import(users, { onDuplicateKeyUpdate: true });
  expect(user.reload().age).toBe(20); // should be updated
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
