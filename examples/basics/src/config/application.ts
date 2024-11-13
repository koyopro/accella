import { join } from "path";

export class Path {
  constructor(public readonly path: string) {}

  join(...paths: string[]): Path {
    return new Path(join(this.path, ...paths));
  }
}

export const Accel = {
  get root(): Path {
    return new Path(process.cwd());
  },
};
