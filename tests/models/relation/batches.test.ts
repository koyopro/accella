import { $user } from "../../factories/user";
import { User } from "../index";

test("#findEach()", () => {
  for (const name of ["foo", "bar", "baz"]) {
    $user.create({ name });
  }
  const results: User[] = [];
  User.all().findEach({ batchSize: 2 }, (record) => {
    results.push(record);
  });
  expect(results.map((u) => u.name)).toEqual(["foo", "bar", "baz"]);
});

test("#findInBatches()", () => {
  for (const name of ["foo", "bar", "baz"]) {
    $user.create({ name });
  }
  const results: User[][] = [];
  User.all().findInBatches({ batchSize: 2 }, (records) => {
    results.push(records);
  });
  expect(results.length).toBe(2);
  expect(results[0].map((u) => u.name)).toEqual(["foo", "bar"]);
  expect(results[1].map((u) => u.name)).toEqual(["baz"]);
});

test("#findInBatches() without batchSize", () => {
  for (const name of ["foo", "bar", "baz"]) {
    $user.create({ name });
  }
  const results: User[][] = [];
  User.all().findInBatches({}, (records) => {
    results.push(records);
  });
  expect(results.length).toBe(1);
  expect(results[0].map((u) => u.name)).toEqual(["foo", "bar", "baz"]);
});
