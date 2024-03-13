import { User } from "../models/index.js";
import { defineFactory } from "accel-record-factory";

export const UserFactory = defineFactory(User, ({ seq }) => ({
  name: "hoge",
  email: `user${seq}@email.com`,
}));

export { UserFactory as $user };
