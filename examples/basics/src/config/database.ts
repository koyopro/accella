import { initAccelRecord } from "accel-record";
import { getDatabaseConfig } from "../models";

export default async () => {
  await initAccelRecord(getDatabaseConfig());
};
