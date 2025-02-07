import { runInitializers } from "accella/initialize";

test("runInitializers", async () => {
  // TEST_VALUE is set in .env.test
  expect(process.env.TEST_VALUE).toBeUndefined();
  await runInitializers();
  expect(process.env.TEST_VALUE).toBe(`myValue${process.env.VITEST_POOL_ID}`);
});
