import { Model } from "accel-record";
import { $post } from "../factories/post";
import { $user } from "../factories/user";
import { User } from "./index";

test("execute", () => {
  const u = $user.create({
    name: "hoge",
    posts: [$post.build({ title: "title1" })],
  });
  const nameCol = User.attributeToColumn("name")!;
  Model.connection.execute(`update User set ${nameCol} = ? where _id = ?`, [
    "fuga",
    u.id,
  ]);
  expect(u.reload().name).toBe("fuga");

  const r = Model.connection.execute(
    `select count(User._id) as cnt
     from User
     left join Post
       on User._id = Post.author_id
     where Post.title = ?`,
    ["title1"]
  );
  expect(Number(r[0].cnt)).toBe(1);
});

test("knex builder", async () => {
  const u = $user.create({
    name: "hoge",
    posts: [$post.build({ title: "title1" })],
  });
  const column = User.attributeToColumn("name")!;
  {
    const r = User.queryBuilder.select(column).groupBy(column).execute();
    // const r = Model.client.select("name").from("User").groupBy("name").execute();
    expect(r[0][column]).toBe("hoge");
  }
  {
    const knex = Model.connection.knex;
    const r = knex
      .select(column, knex.raw("SUM(_id) as s"))
      .from("User")
      .groupBy("_id")
      .execute();
    expect(r[0][column]).toBe(u.name);
    expect(Number(r[0].s)).toBe(u.id);
  }
});
