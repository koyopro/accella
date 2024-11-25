// subWorker.js
// const { Worker, parentPort } = require('worker_threads');
import { Worker } from "worker_threads";

const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

const subWorker = new Worker("./innerWorker.js", {
  workerData: { sharedBuffer },
});

subWorker.on("message", (message) => {
  console.log("Message from subWorker:", message);
});

subWorker.on("error", (error) => {
  console.error("Error from subWorker:", error);
});

subWorker.on("exit", (code) => {
  console.log("subWorker exited with code:", code);
});

console.log("Waiting for InnerWorker to finish processing...");
// サブスレッドで内部スレッドの処理を同期的に待つ
Atomics.wait(sharedArray, 0, 0);
console.log("InnerWorker has finished processing.");
