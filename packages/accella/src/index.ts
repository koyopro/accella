import Path from "@mojojs/path";
export { program } from "./cli";

export const Accel = {
  get root(): Path {
    return new Path(process.cwd());
  },
};
