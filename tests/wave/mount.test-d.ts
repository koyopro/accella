import { BaseUploader, mount } from "accel-wave";
import type { Profile } from "../models";

test("mount", () => {
  // @ts-expect-error
  mount({} as Profile, "invalidPath", BaseUploader);
});
