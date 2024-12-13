import { initAccelRecord } from "accel-record";
import { dbConfig } from "../vitest.setup";

describe("initAccelRecord", () => {
  test("should not throw error even if called multiple times", async () => {
    const subject = () => initAccelRecord(dbConfig());
    expect(async () => await subject()).not.toThrow();
    expect(async () => await subject()).not.toThrow();
  });
});
