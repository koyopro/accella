import { defineFactory } from "accel-record-factory";
import { User } from "../models/index.js";

export const UserFactory = defineFactory(User, {
  name: "hoge",
  email: (seq) => `user${seq}@email.com`,
});

export { UserFactory as $user };
