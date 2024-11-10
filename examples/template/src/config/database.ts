import { initAccelRecord } from "accel-record";
import { Accel } from "./application";

export const setupDatabase = async () => {
  const sqlitePath = Accel.root.join(
    "./db/schema/",
    import.meta.env.DATABASE_URL.replace("file:", "")
  );
  await initAccelRecord({
    type: "sqlite",
    datasourceUrl: sqlitePath.path,
  });
};
