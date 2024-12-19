import fs from "fs";
import { $Profile } from "../factories/profile";
import { $user } from "../factories/user";
import { Profile } from "../models";

test("mount", () => {
  const user = $Profile.create({ user: $user.create() });
  const file = new File([], "example.png", { type: "image/png" });
  const target = `${process.cwd()}/public/uploads/example.png`;
  user.avatar.file = file;
  user.save();
  expect(fs.existsSync(target)).toBeTruthy();
  expect(user.avatarPath).toBe("example.png");

  const p = Profile.find(user.id);
  expect(p.avatar.file?.name).toBe("example.png");

  fs.unlinkSync(target);
});
