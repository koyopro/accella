import { UserFactory as $user } from "tests/factories/user";
import { Post } from "..";

test("@attribute decorator", () => {
  const p = Post.create({ title: "foo", author: $user.create(), hidden: true });
  expect(p.published).toBe(false);
});
