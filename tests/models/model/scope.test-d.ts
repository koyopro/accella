import { Model, scope } from "accel-record";
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

  User.first()!.posts.john();

  class TestModel extends Model {
    @scope
    static test() {
      return this.all();
    }
    // @ts-expect-error
    @scope
    static teenagers() {
      this.count();
    }
  }
});
