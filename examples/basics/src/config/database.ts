import { initAccelRecord } from "accel-record";
import { getDatabaseConfig } from "../models";

export const setupDatabase = async () => {
  await initAccelRecord(getDatabaseConfig());
};
