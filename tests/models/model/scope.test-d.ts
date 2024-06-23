import { Post, User } from "..";

test("scope", () => {
  User.john();
  User.all().john().adults().count();
  User.adults().john().count();
  // @ts-expect-error
  User.select("id").john();

  Post.john();
  Post.all().john();
  // @ts-expect-error
  Post.adults();
  // @ts-expect-error
  Post.all().adults();
});
