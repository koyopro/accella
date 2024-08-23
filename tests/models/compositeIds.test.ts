import { UserTeam } from ".";
import { $team } from "../factories/team";
import { $user } from "../factories/user";
import { $UserTeam } from "../factories/userTeam";

test("find()", () => {
  const ut = $UserTeam.create({
    user: $user.create(),
    team: $team.create(),
    assignedBy: "text1",
  });
  expect(ut.reload().assignedBy).toBe("text1");
  expect(ut.primaryKeys).toEqual(["userId", "teamId"]);
  expect(UserTeam.find([ut.userId, ut.teamId]).assignedBy).toBe("text1");
});
