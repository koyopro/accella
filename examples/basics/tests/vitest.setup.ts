import { DatabaseCleaner, Migration, initAccelRecord, stopWorker } from "accel-record";

import { getDatabaseConfig } from "src/models/index";

beforeAll(async () => {
  // Vitest usually performs tests in a multi-threaded manner.
  // To use different databases in each thread, separate the databases using VITEST_POOL_ID.
  const datasourceUrl = new URL(`../db/test${process.env.VITEST_POOL_ID}.db`, import.meta.url)
    .pathname;
  await initAccelRecord({
    ...getDatabaseConfig(),
    datasourceUrl,
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
