import { $user } from "../../factories/user";
import { User } from "../index";

test("#findEach()", () => {
  for (const name of ["foo", "bar", "baz"]) {
    $user.create({ name });
  }
  const results: User[] = [];
  for (const record of User.all().findEach({ batchSize: 2 })) {
    results.push(record);
  }
  expect(results.map((u) => u.name).sort()).toEqual(["bar", "baz", "foo"]);
});

test("#findInBatches()", () => {
  for (const name of ["foo", "bar", "baz"]) {
    $user.create({ name });
  }
  const results: User[][] = [];
  for (const records of User.all().findInBatches({ batchSize: 2 })) {
    results.push(records);
  }
  expect(results.length).toBe(2);
  expect(results[0].map((u) => u.name)).toEqual(["foo", "bar"]);
  expect(results[1].map((u) => u.name)).toEqual(["baz"]);
});

test("#findInBatches() without batchSize", () => {
  for (const name of ["foo", "bar", "baz"]) {
    $user.create({ name });
  }
  const results: User[][] = [];
  for (const records of User.all().findInBatches()) {
    results.push(records);
  }
  expect(results.length).toBe(1);
  expect(results[0].map((u) => u.name)).toEqual(["foo", "bar", "baz"]);
});
