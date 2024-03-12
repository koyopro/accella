import { initAccelRecord } from "accel-record";
import { User } from "../tests/models/index.js";

initAccelRecord({
  type: "mysql",
  knexConfig: {
    client: "mysql2",
    connection: {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: `accel_test`,
    },
  },
}).then(() => {
  User.create({ email: "a4" });
});
