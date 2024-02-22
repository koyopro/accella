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

  test('.isEmpty()', () => {
    expect(User.isEmpty()).toBe(true);
    $user.create();
    expect(User.isEmpty()).toBe(false);
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

  test('.offset()', () => {
    $user.create({ name: 'hoge' });
    $user.create({ name: 'fuga' });
    expect(User.offset(1).first()?.name).toBe('fuga');
  });

  test('.limit()', () => {
    $user.create({ name: 'hoge' });
    $user.create({ name: 'fuga' });
    expect(User.limit(1).toArray()).toHaveLength(1);
  });
});
