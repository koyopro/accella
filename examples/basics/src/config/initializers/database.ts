import { initAccelRecord } from "accel-record";
import { getDatabaseConfig } from "../../models";

export default async () => {
  const config = getDatabaseConfig();

  if (process.env.NODE_ENV === "test") {
    // Vitest usually performs tests in a multi-threaded manner.
    // To use different databases in each thread, separate the databases using VITEST_POOL_ID.
    config.datasourceUrl = new URL(
      `../../../db/test${process.env.VITEST_POOL_ID}.db`,
      import.meta.url
    ).pathname;
  }

  await initAccelRecord(config);
};
