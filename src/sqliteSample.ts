import { initAccelRecord } from "accel-record";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../tests/models/index.js";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

initAccelRecord({
  type: "sqlite",
  datasourceUrl: path.resolve(__dirname, "../tests/prisma/test.db"),
}).then(() => {
  User.create({ email: `${Date.now()}@example.com` });
  console.log(User.count());
});
