import { getInitialized } from "../src/config/initializers/sample";

test("config/initializers", async () => {
  expect(getInitialized()).toBe(false);
  await import("accella/middleware");
  expect(getInitialized()).toBe(true);
});
