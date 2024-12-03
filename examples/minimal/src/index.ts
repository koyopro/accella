// src/index.ts
import { initAccelRecord } from "accel-record";
import { getDatabaseConfig, User } from "./models/index.js";

initAccelRecord(getDatabaseConfig()).then(() => {
  User.create({
    firstName: "John",
    lastName: "Doe",
  });
  console.log(`New user created! User.count is ${User.count()}`);
});
