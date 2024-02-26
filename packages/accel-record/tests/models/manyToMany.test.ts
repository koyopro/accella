import { PostTag } from ".";
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

  test.only("create Implicit", () => {
    const post = $post.create({ author: $user.create() });
    const postTag = $postTag.create();
    const p = Post.first();
    expect(p?.tags.toArray()).toEqual([]);
    // console.log(Post.associations);
    // console.log(PostTag.associations);
    // post.tags.push(postTag);
  });
});
