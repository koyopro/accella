import { Setting, User } from "..";

test("modelName.human", () => {
  expect(User.modelName.human).toBe("User");
  expect(Setting.modelName.human).toBe("Setting");
});
