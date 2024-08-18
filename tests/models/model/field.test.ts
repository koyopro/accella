import { User } from "..";

test("cast number", () => {
  const subject = (value: any) => User.build({ age: value }).age;
  expect(subject(20)).toBe(20);
  expect(subject("123")).toBe(123);
  expect(subject(undefined)).toBeUndefined();
  expect(subject("")).toBeUndefined();
  expect(subject("abc123")).toBeUndefined();
});
