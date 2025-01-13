import { initAccelRecord } from "accel-record";
import "accel-record/errors";
import "accel-record/search";
import { getDatabaseConfig, User } from "../tests/models/index.js";

const config = getDatabaseConfig();
// config.datasourceUrl += "?timezone=+09:00";
console.log(config);
initAccelRecord(config).then(() => {
  // User.create({ email: `${Date.now()}@example.com` });
  console.log(User.count());
  console.log(User.all().map((u) => u.createdAt.toString()));
  process.exit(0);
});
