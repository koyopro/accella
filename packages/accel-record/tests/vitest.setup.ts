import { Model, getPrismaClientConfig, stopRpcClient } from "accel-record-core";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import "./models/index.js";

beforeAll(() => {
  process.env.DATABASE_URL = getPrismaClientConfig().datasourceUrl;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const schemaPath = path.resolve(__dirname, "./prisma/schema.prisma");
  execSync(`npx prisma migrate dev --schema=${schemaPath} --skip-generate`, {
    stdio: "inherit",
  });
});

beforeEach(async () => {
  Model.startTransaction();
});

afterEach(async () => {
  Model.rollbackTransaction();
});

afterAll(async () => {
  stopRpcClient();
});
