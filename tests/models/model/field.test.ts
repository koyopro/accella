import { User } from "..";

test("cast number", () => {
  const subject = (value: any) => User.build({ age: value }).age;
  expect(subject(undefined)).toBeUndefined();
  expect(subject("")).toBeUndefined();
  expect(subject(20)).toBe(20);
});
