import { initAccelRecord } from "accel-record";

export const setupDatabase = async () => {
  await initAccelRecord({
    type: "sqlite",
    datasourceUrl: process.env.DATABASE_URL,
  });
};
