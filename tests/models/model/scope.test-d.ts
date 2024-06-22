import { User } from "..";

test("scope", () => {
  User.john();
  User.all().john().adults().count();
  User.adults().john().count();
  User.all()
    .includes()
    .joins()
    .joinsRaw("")
    .order("name")
    .offset(0)
    .limit(0)
    .where({})
    .whereNot({})
    .whereRaw("")
    .adults()
    .count();
});
