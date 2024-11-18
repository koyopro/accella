import Path from "@mojojs/path";

export const Accel = {
  get root(): Path {
    return new Path(process.cwd());
  },
};
