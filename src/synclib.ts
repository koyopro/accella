import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// @ts-ignore
import SyncRpc, { stop } from "../packages/accel-record-core/src/sync-rpc/index.js";
import { buildSync } from "esbuild";

export type Actions = Record<string, ((...args: any[]) => any) | undefined>;
export const defineRpcSyncActions = (actions: Actions) => {
  const ret = () =>
    async function (params: { method: keyof Actions; args: any[] }) {
      const { method, args } = params || {};
      return actions[method]?.(...(args || []));
    };
  ret.launch = () => {
    const source = path.resolve(__dirname, "./worker.ts");
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
