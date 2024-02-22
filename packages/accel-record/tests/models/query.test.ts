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

  test('.count()', () => {
    expect(User.count()).toBe(0);
    $user.create();
    expect(User.count()).toBe(1);
  });

  test('.order()', () => {
    $user.create({ age: 20 });
    $user.create({ age: 10 });
    expect(User.order('age').first()?.age).toBe(10);
    expect(User.order('age', 'desc').first()?.age).toBe(20);
  });
});
