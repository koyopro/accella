import { User } from "..";

test("Relation#toHashArray()", () => {
  const users = User.all().toHashArray();
  expectTypeOf(users[0]).toEqualTypeOf<{
    id: number;
    name: string | undefined;
    age: number | undefined;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }>();

  const withSelect = User.select("id").toHashArray();
  expectTypeOf(withSelect).toEqualTypeOf<never>();
});
