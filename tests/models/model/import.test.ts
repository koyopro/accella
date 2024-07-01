import { $user } from "../../factories/user.js";
import { $ValidateSample } from "../../factories/validateSample.js";
import { User, ValidateSample } from "../index.js";
import { UserModel } from "../user.js";

test(".import", () => {
  const users = [
    $user.build({ email: "foo@example.com" }),
    $user.build({ email: "bar@example.com" }),
  ];
  const result = User.import(users);
  expect(User.count()).toBe(2);
  expect(result.numInserts).toBe(2);
});

test(".import with Array of Hash", () => {
  const users = [{ email: "foo@example.com" }, { email: "bar@example.com" }];
  User.import(users);
  expect(User.count()).toBe(2);
  expect(User.first()?.email).toBe("foo@example.com");
});

describe(".import with onDuplicateKeyUpdate", () => {
  let user: User;
  let users: UserModel[];

  beforeEach(() => {
    user = $user.create({ email: "foo@example.com", name: "foo", age: 10 });
    users = [
      $user.build({ email: "foo@example.com", name: "foo2", age: 20 }), // conflict
      $user.build({ email: "bar@example.com", name: "bar", age: 30 }), // new
    ];
  });

  test("when error", () => {
    expect(() => User.import(users)).toThrow();
  });

  test("when valid", () => {
    const subject = (onDuplicateKeyUpdate: true | ["name"]) => {
      if (User.connection.adapterName === "mysql") {
        User.import(users, { onDuplicateKeyUpdate: onDuplicateKeyUpdate });
      } else {
        User.import(users, {
          onDuplicateKeyUpdate: onDuplicateKeyUpdate,
          conflictTarget: ["email"],
        });
      }
    };
    subject(["name"]);
    user.reload();
    expect(user.name).toBe("foo2"); // should be updated
    expect(user.age).toBe(10); // should not be updated

    subject(true);
    expect(user.reload().age).toBe(20); // should be updated
  });
});

test(".import with validation error", () => {
  const records = [
    $ValidateSample.build({}), // valid
    $ValidateSample.build({ key: "xs" }), // invalid
  ];
  const result = ValidateSample.import(records);
  expect(result.numInserts).toBe(1);
  expect(result.failedInstances.length).toBe(1);
  expect(ValidateSample.count()).toBe(1);
});

test(".import without validation", () => {
  const records = [
    $ValidateSample.build({}), // valid
    $ValidateSample.build({ key: "xs" }), // invalid
  ];
  const result = ValidateSample.import(records, { validate: false });
  expect(result.numInserts).toBe(2);
  expect(result.failedInstances.length).toBe(0);
  expect(ValidateSample.count()).toBe(2);
});

test(".import with thrown validation error", () => {
  const records = [
    $ValidateSample.build({}), // valid
    $ValidateSample.build({ key: "xs" }), // invalid
  ];
  expect(() => ValidateSample.import(records, { validate: "throw" })).toThrow();
});
