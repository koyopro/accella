import { $user } from "../factories/user";
import { User } from "./user";

describe('Query', () => {
  test('.first()', () => {
    expect(User.first()).toBeUndefined();
    $user.create();
    expect(User.first()).not.toBeUndefined();
  });

  test('.exists()', () => {
    expect(User.exists()).toBe(false);
    $user.create();
    expect(User.exists()).toBe(true);
  });
});
