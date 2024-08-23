import { User, UserTeam } from ".";

test("find()", () => {
  User.find(1);
  UserTeam.find([1, 1]);

  User.all().find(1);
  UserTeam.all().find([1, 1]);
});
