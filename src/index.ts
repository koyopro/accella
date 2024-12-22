import { initAccelRecord } from "accel-record";
import "accel-record/errors";
import "accel-record/search";
import { worker } from "accel-wave";
import { getDatabaseConfig, User } from "../tests/models/index.js";

initAccelRecord(getDatabaseConfig()).then(() => {
  // User.create({ email: `${Date.now()}@example.com` });
  console.log(User.count());
  worker.terminate();
});
