import { User } from "..";
import { $post } from "../../factories/post";
import { $user } from "../../factories/user";

test("scope", () => {
  $user.create({ name: "John", age: 19 });
  $user.create({ name: "John", age: 20 });

  expect(User.john().count()).toBe(2);
  expect(User.john().adults().count()).toBe(1);
  expect(User.adults().john().count()).toBe(1);
});

test("scope from Collection", () => {
  const users = $user.createList(2);
  $post.create({ title: "John", author: users[0] });
  $post.create({ title: "Smith", author: users[0] });
  $post.create({ title: "John", author: users[1] });

  expect(users[0].posts.john().count()).toBe(1);
});
