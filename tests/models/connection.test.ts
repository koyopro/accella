import { Model } from "accel-record";
import { $post } from "../factories/post";
import { $user } from "../factories/user";
import { User } from "./index";

test("execute", () => {
  const u = $user.create({
    name: "hoge",
    posts: [$post.build({ title: "title1" })],
  });
  Model.connection.execute("update User set name = 'fuga' where id = ?", [
    u.id,
  ]);
  expect(User.find(u.id)!.name).toBe("fuga");

  const r = Model.connection.execute(
    `select count(User.id) as cnt
     from User
     left join Post
       on User.id = Post.authorId
     where Post.title = ?`,
    ["title1"]
  );
  expect(r[0].cnt).toBe(1);
});

test("knex builder", async () => {
  const u = $user.create({
    name: "hoge",
    posts: [$post.build({ title: "title1" })],
  });
  {
    const r = User.client.select("name").groupBy("name").execute();
    // const r = Model.client.select("name").from("User").groupBy("name").execute();
    expect(r[0].name).toBe("hoge");
  }
  {
    const r = User.client
      .select("name", Model.connection.knex.raw("SUM(id) as s"))
      .groupBy("id")
      .execute();
    expect(r[0].name).toBe(u.name);
    expect(Number(r[0].s)).toBe(u.id);
  }
});
