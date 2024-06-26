import { $user } from "../factories/user";

test("traits", () => {
  const admin = $user.build({}, "admin");
  expect(admin.name).toBe("admin");

  const john = $user.create({ age: 10 }, "john");
  expect(john.name).toBe("John");
  expect(john.age).toBe(10);

  const admins = $user.buildList(2, {}, "admin", "withSetting");
  expect(admins[0].name).toBe("admin");
  expect(admins[1].setting).not.toBeUndefined();

  const johns = $user.createList(2, {}, "john", "withSetting");
  expect(johns[0].name).toBe("John");
  expect(johns[1].setting).not.toBeUndefined();
});
