import { initAccelRecord } from "accel-record";
import "accel-record/errors";
import "accel-record/search";
import { User } from "../tests/models/index.js";

initAccelRecord({
  type: "mysql",
  datasourceUrl: "mysql://root:@localhost:3306/accel_test1",
  //   knexConfig: {
  //     client: "mysql2",
  //     connection: {
  //       host: "localhost",
  //       port: 3306,
  //       user: "root",
  //       password: "",
  //       database: `accel_test`,
  //     },
  //   },
}).then(() => {
  // User.create({ email: `${Date.now()}@example.com` });
  console.log(User.count());
});
