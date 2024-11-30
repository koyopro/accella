import { actions, getWorker } from "./launchedWorker";

test("sync actinos", () => {
  expect(actions.ping()).toBe("pong!?");
  getWorker()!.terminate();
});
