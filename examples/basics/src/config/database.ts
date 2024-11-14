import { initAccelRecord } from "accel-record";
import { Accel } from "accella";

export const setupDatabase = async () => {
  const sqlitePath = Accel.root.child(
    "./db/schema/",
    import.meta.env.DATABASE_URL.replace("file:", "")
  );
  await initAccelRecord({
    type: "sqlite",
    datasourceUrl: sqlitePath.toString(),
  });
};
