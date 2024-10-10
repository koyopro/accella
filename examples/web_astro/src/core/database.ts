import "../models";
import { initAccelRecord } from "accel-record";

export const initDatabase = async () => {
  await initAccelRecord({
    type: "mysql",
    datasourceUrl: process.env.DATABASE_URL,
  });
};
