import { PostTag, User } from "..";
import { $post } from "../../factories/post";
import { $postTag } from "../../factories/postTag";
import { $user } from "../../factories/user";

test("multi level joins()", () => {
  const u = $user.create({ name: "John" });
  const p = $post.create({ author: u });
  $postTag.create({ posts: [p], name: "tag1" });

  expect(
    User.joins({ posts: "tags" }).where("PostTag.name = ?", "tag1").count()
  ).toBe(1);
  expect(
    User.joins({ posts: ["tags"] })
      .where("PostTag.name = ?", "tag1")
      .count()
  ).toBe(1);

  expect(
    PostTag.joins({ posts: "author" })
      .where({ posts: { author: { name: "John" } } })
      .count()
  ).toBe(1);
});
