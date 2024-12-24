import fs from "fs";
import { $Profile } from "../factories/profile";
import { $user } from "../factories/user";
import { Profile } from "../models";

test("mount", () => {
  const profile = $Profile.create({ user: $user.create() });
  const file = new File([], "example.png", { type: "image/png" });
  const target = `${process.cwd()}/public/uploads/example.png`;
  profile.avatar.file = file;
  profile.save();
  expect(fs.existsSync(target)).toBeTruthy();
  expect(profile.avatarPath).toBe("example.png");

  const p = Profile.find(profile.id);
  expect(p.avatar.file?.name).toBe("example.png");

  p.destroy();
  expect(fs.existsSync(target)).toBeFalsy();
});
