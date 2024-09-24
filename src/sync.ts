import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// @ts-ignore
import SyncRpc, { stop } from "../packages/accel-record-core/src/sync-rpc/index.js";
import { buildSync } from "esbuild";

const source = path.resolve(__dirname, "./worker.ts");
const outfile = `${source}.mjs`;
buildFile(source, outfile);
const client = SyncRpc(outfile, {});

console.log(client());
console.log(client({ method: "ping" }));
console.log(client({ method: "incr", args: [3] }));

stop();

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
