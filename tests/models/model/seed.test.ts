import { User } from "..";

test(".seed()", () => {
  const [user] = User.seed({ id: 1, email: "foo@example.com" });
  expect(User.count()).toEqual(1);
  expect(user.email).toEqual("foo@example.com");

  // update with seed
  User.seed({ id: 1, email: "bar@example.com" });
  expect(User.count()).toEqual(1);
  expect(user.reload().email).toEqual("bar@example.com");

  // multi seed data
  const multiResult = User.seed(
    { id: 2, email: "baz@example.com" },
    { id: 3, email: "foo@example.com" }
  );
  expect(multiResult.length).toEqual(2);
  expect(User.count()).toEqual(3);
});

test(".seed() with invalid data", () => {
  // If there is even one issue, the entire operation is rolled back
  expect(() =>
    User.seed({ id: 2, email: "baz@example.com" }, { id: 3, email: undefined } as any)
  ).toThrowError();
  expect(User.count()).toEqual(0);
});

test(".seedBy()", () => {
  const [user] = User.seedBy(["email"], { email: "foo@example.com", name: "John" });
  expect(User.count()).toEqual(1);
  expect(user.email).toEqual("foo@example.com");
  expect(user.name).toEqual("John");

  // update with seed
  User.seedBy(["email"], { email: "foo@example.com", name: "Bob" });
  expect(User.count()).toEqual(1);
  expect(user.reload().name).toEqual("Bob");

  // multi seed data
  const multiResult = User.seedBy(
    ["email"],
    { email: "bar@example.com" },
    { email: "baz@example.com" }
  );
  expect(multiResult.length).toEqual(2);
  expect(User.count()).toEqual(3);
});
