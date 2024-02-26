import { $team } from "../factories/team";
import { $user } from "../factories/user";
import { UserTeam } from "./userTeam";

describe("ManyToMany", () => {
  test("create", () => {
    const user = $user.create();
    const team = $team.create();
    UserTeam.create({ user, team, assignedBy: "" });

    expect(user.teams.first()?.team.equals(team)).toBeTruthy();
    expect(team.users.first()?.user.equals(user)).toBeTruthy();
  });
});
