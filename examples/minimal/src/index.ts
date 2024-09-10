// src/index.ts
import { initAccelRecord } from "accel-record";
import { User } from "./models/index.js";

initAccelRecord({
  type: "mysql",
  datasourceUrl: "mysql://root:@localhost:3306/accel_test_minimal",
}).then(() => {
  User.create({
    firstName: "John",
    lastName: "Doe",
  });
  console.log(`New user created! User.count is ${User.count()}`);
});
