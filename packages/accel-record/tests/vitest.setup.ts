import { fileURLToPath } from "url";
import path from "path";
import { execSync } from "child_process";

beforeAll(() => {
  process.env.DATABASE_URL = `file:./test${process.env.VITEST_POOL_ID}.db`;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const schemaPath = path.resolve(__dirname, "./prisma/schema.prisma");
  execSync(`npx prisma migrate dev --schema=${schemaPath}`, {
    stdio: "inherit",
  });
});

beforeEach(async () => {
  console.log("beforeEach");
});

afterEach(async () => {
  console.log("afterEach");
});
