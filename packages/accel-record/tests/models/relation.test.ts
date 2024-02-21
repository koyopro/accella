import { $user } from "../factories/user";
import { User } from "./user";

describe("Relation", () => {
  test("#toArray()", () => {
    $user.createList(2)
    expect(User.all().toArray()).toHaveLength(2);
  });

  test("#first()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    expect(User.all().first()?.name).toBe("hoge");
  });

  test("#count()", () => {
    $user.createList(2)
    expect(User.all().count()).toBe(2);
  });

  test("#exists()", () => {
    expect(User.all().exists()).toBe(false);
    $user.create();
    expect(User.all().exists()).toBe(true);
  });

  test("#isEmpty()", () => {
    expect(User.all().isEmpty()).toBe(true);
    $user.create();
    expect(User.all().isEmpty()).toBe(false);
  });

  test("#limit()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    const users = User.all().limit(1).toArray();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("hoge");
  });

  test("#offset()", () => {
    $user.create({ name: "hoge" });
    $user.create({ name: "fuga" });
    const users = User.all().offset(1).limit(1).toArray();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("fuga");
  });
});
