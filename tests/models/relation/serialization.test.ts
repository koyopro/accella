import { User } from "..";
import { $user } from "../../factories/user";

const objectContaining = expect.objectContaining;

test("Relation#toHashArray()", () => {
  $user.create({ name: "hoge" });
  $user.create({ name: "fuga", age: 20 });

  const users = User.all().toHashArray();
  expect(users).toHaveLength(2);
  expect(users[0]).toEqual(
    objectContaining({
      name: "hoge",
      age: undefined,
    })
  );
  expect(users[1]).toEqual(
    objectContaining({
      name: "fuga",
      age: 20,
    })
  );

  expect(User.all().toHashArray({ only: ["name", "age"] })[0]).toEqual({
    name: "hoge",
    age: undefined,
  });
});

test("Relation#toJson()", () => {
  const now = new Date("Tue, 01 Dec 2024 10:00:00 GMT");
  $user.create({ name: "hoge", createdAt: now });
  $user.create({ name: "fuga", createdAt: now });

  const result = User.all().toJson({ only: ["name", "createdAt"] });
  expect(result).toEqual(
    JSON.stringify([
      {
        name: "hoge",
        createdAt: "2024-12-01T10:00:00.000Z",
      },
      {
        name: "fuga",
        createdAt: "2024-12-01T10:00:00.000Z",
      },
    ])
  );
});
