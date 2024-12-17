import { $user } from "../factories/user";
import fs from "fs";

test("mount", () => {
  const user = $user.create();
  const file = new File([], "example.png", { type: "image/png" });
  const target = `${process.cwd()}/public/uploads/example.png`;
  user.avatar.file = file;
  user.save();
  expect(fs.existsSync(target)).toBeTruthy();
  expect(user.avatarPath).toBe("example.png");
  fs.unlinkSync(target);
});
