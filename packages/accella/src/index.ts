import Path from "@mojojs/path";
export { program } from "./cli.js";

export const Accel = {
  get root(): Path {
    return new Path(process.cwd());
  },
};
