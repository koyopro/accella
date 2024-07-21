import {
  DatabaseCleaner,
  Migration,
  initAccelRecord,
  stopWorker,
} from "accel-record";
import path from "path";
import { fileURLToPath } from "url";

import "src/models/index.js";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeAll(async () => {
  await initAccelRecord({
    type: "mysql",
    // logLevel: "DEBUG",
    prismaDir: path.resolve(__dirname, "../prisma"),
    datasourceUrl: `mysql://root:@localhost:3306/web_astro_test${process.env.VITEST_POOL_ID}`,
  });
  await Migration.migrate();
});

beforeEach(async () => {
  DatabaseCleaner.start();
});

afterEach(async () => {
  DatabaseCleaner.clean();
});

afterAll(async () => {
  stopWorker();
});
