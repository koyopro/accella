import { rpcClient } from "accel-record-core/src/database";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// TODO: indexからimportしたい(テストが通らなくなる)
import './models/user.js'
import './models/post.js'
import './models/setting.js'

beforeAll(() => {
  process.env.DATABASE_URL = `file:./test${process.env.VITEST_POOL_ID}.db`;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const schemaPath = path.resolve(__dirname, "./prisma/schema.prisma");
  execSync(`npx prisma migrate dev --schema=${schemaPath}`, {
    stdio: "inherit",
  });
});

beforeEach(async () => {
  rpcClient({ sql: "BEGIN TRANSACTION test_transaction", bindings: [] });
});

afterEach(async () => {
  rpcClient({ sql: "ROLLBACK TRANSACTION test_transaction", bindings: [] });
});
