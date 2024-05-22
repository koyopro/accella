import { Model, initAccelRecord } from "accel-record-core";
import { dbConfig } from "../vitest.setup";

describe("initAccelRecord", () => {
  test("should not throw error even if called multiple times", async () => {
    const subject = () => initAccelRecord(dbConfig());
    // for afterEach
    const restartTx = () => Model.startTransaction();

    expect(async () => await subject()).not.toThrow();
    restartTx();
    expect(async () => await subject()).not.toThrow();
    restartTx();
  });
});
