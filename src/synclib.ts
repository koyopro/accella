import { buildSync } from "esbuild";
import { fileURLToPath } from "url";
// @ts-ignore
import SyncRpc, { stop } from "../packages/accel-record-core/src/sync-rpc/index.js";

export type Actions = Record<string, (...args: any[]) => any>;
type AwaitedFunc<F extends Actions, K extends keyof F> = (
  ...args: Parameters<F[K]>
) => Awaited<ReturnType<F[K]>>;

export const defineRpcSyncActions = <F extends Actions>(filename: string, actions: F) => {
  const ret = () =>
    async function (params: { method: keyof F; args: any[] }) {
      const { method, args } = params || {};
      return actions[method]?.(...(args || []));
    };
  ret.launch = (): { [K in keyof F]: AwaitedFunc<F, K> } => {
    const source = filename.startsWith("file://") ? fileURLToPath(filename) : filename;
    const outfile = `${source}.mjs`;
    buildFile(source, outfile);
    const s = SyncRpc(outfile, {});
    for (const method in actions) {
      s[method] = (...args: any[]) => s({ method, args });
    }
    return s;
  };
  ret.stop = stop;
  return ret;
};

function buildFile(filePath: string, outfile: string) {
  buildSync({
    entryPoints: [filePath],
    outfile: outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    sourcemap: false,
    allowOverwrite: true,
    packages: "external",
    target: "node18",
  });
}
