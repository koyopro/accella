import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// @ts-ignore
import SyncRpc, { stop } from "../packages/accel-record-core/src/sync-rpc/index.js";

const client = SyncRpc(path.resolve(__dirname, "./worker.mjs"), {});

console.log(client());
console.log(client({ method: "ping" }));
console.log(client({ method: "incr", args: [3] }));

stop();
