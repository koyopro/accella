import { defineFactory } from "accel-record-factory";
import { User } from "../models/index.js";
import { $setting } from "./setting.js";

export const UserFactory = defineFactory(
  User,
  {
    name: "hoge",
    email: (seq) => `user${seq}@email.com`,
  },
  {
    traits: {
      admin: {
        name: "admin",
      },
      john: () => ({
        name: "John",
        age: 20,
      }),
      withSetting: {
        setting: () => $setting.build(),
      },
    },
  }
);

export { UserFactory as $user };
