import { defineFactory } from "accel-record-factory";
import { UserTeam } from "../models/index.js";

export const UserTeamFactory = defineFactory(UserTeam, {
  // userId: 1,
  // teamId: 1,
  // assignedBy: "MyString"
});

export { UserTeamFactory as $UserTeam };
