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
