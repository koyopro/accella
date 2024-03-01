import { $post } from "../factories/post";
import { $postTag } from "../factories/postTag";
import { $team } from "../factories/team";
import { $user } from "../factories/user";
import { Post } from "./post";
import { UserTeam } from "./userTeam";

describe("ManyToMany", () => {
  test("create", () => {
    const user = $user.create();
    const team = $team.create();
    UserTeam.create({ user, team, assignedBy: "" });

    expect(user.teams.first()?.team.equals(team)).toBeTruthy();
    expect(team.users.first()?.user.equals(user)).toBeTruthy();
  });

  test("create Implicit", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    expect(Post.find(p.id).tags.toArray()).toEqual([]);
    p.tags.push(postTag);
    expect(Post.find(p.id).tags.map((t) => t.id)).toEqual([postTag.id]);
  });

  test("deleteAll()", () => {
    const user = $user.create();
    const team = $team.create();
    UserTeam.create({ user, team, assignedBy: "" });

    expect(user.teams.deleteAll().length).toEqual(1);
    expect(user.teams.toArray()).toEqual([]);
  });

  test.only("deleteAll() Implicit", () => {
    const p = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    p.tags.push(postTag);

    expect(p.tags.deleteAll().length).toEqual(1);
    expect(Post.find(p.id).tags.toArray()).toEqual([]);
  });
});
