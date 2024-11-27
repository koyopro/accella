import actions from "./worker";

test("sync actinos", () => {
  const client = actions.launch();

  expect(client.ping()).toBe("pong!?");
  expect(client.incr(3)).toBe(4);
  expect(client.magic(0)).toBe(1);
  expect(client.magic(1)).toBe(3);
  expect(client.magic(2)).toBe(5);

  actions.stop();
});
