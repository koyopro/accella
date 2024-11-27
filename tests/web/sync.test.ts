import actions from "./worker";
import fail from "./workerWithError";

test("sync actinos", async () => {
  const { client } = await actions.launch();

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

test.only("sync actinos with error", async () => {
  expect(fail.launch()).rejects.toThrowError("Sample error on launching worker.");
});
