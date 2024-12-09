import { initAccelRecord, stopWorker } from "accel-record";
import "accel-record/errors";
import "accel-record/search";
import { getDatabaseConfig, User } from "../tests/models/index.js";

initAccelRecord(getDatabaseConfig()).then(() => {
  // User.create({ email: `${Date.now()}@example.com` });
  console.log(User.count());
  stopWorker();
});
