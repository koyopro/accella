import { initAccelRecord } from "accel-record";
import { getDatabaseConfig } from "../models";

export const initDatabase = async () => {
  await initAccelRecord(getDatabaseConfig());
};
