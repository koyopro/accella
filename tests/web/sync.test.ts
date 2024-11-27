import actions from "./worker";
import fail from "./workerWithError";

test("sync actinos", async () => {
  const { client } = actions.launch();

  expect(client.ping()).toBe("pong!?");
  expect(client.incr(3)).toBe(4);
  expect(client.magic(0)).toBe(1);
  expect(client.magic(1)).toBe(3);
  expect(client.magic(2)).toBe(5);
  expect(client.errorSample).toThrowError("errorSample");
  try {
    client.myErrorTest();
  } catch (e) {
    expect(e).toMatchObject({ name: "MyError", message: "myErrorTest", prop1: "foo" });
  }

  actions.stop();
});

test("sync actinos with error", async () => {
  const { worker } = fail.launch();
  await new Promise<void>((resolve) => {
    worker.on("error", (error) => {
      expect(error).toMatchObject({ message: "Sample error on launching worker." });
      resolve();
    });
  });
});
