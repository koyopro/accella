import { Team } from "../models/index.js";
import { defineFactory } from "accel-record-factory";

export const TeamFactory = defineFactory(Team, ({ seq }) => ({
  name: `team${seq}`,
}));

export { TeamFactory as $team };
