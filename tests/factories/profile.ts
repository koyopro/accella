import { defineFactory } from "accel-record-factory";
import { Profile } from "../models/index.js";

export const ProfileFactory = defineFactory(Profile, {
  // userId: 1
});

export { ProfileFactory as $Profile };
