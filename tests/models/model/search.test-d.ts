import { User } from "..";

test(".search()", () => {
  expectTypeOf(User.search({}).result()).toEqualTypeOf(User.all());
  expectTypeOf(User.all().search({}).result()).toEqualTypeOf(User.all());
});
