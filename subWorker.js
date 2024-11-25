// subWorker.js
// const { Worker, parentPort } = require('worker_threads');
import { Worker, parentPort } from "worker_threads";

const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

const subWorker = new Worker("./innerWorker.js", {
  workerData: { sharedBuffer },
});

subWorker.on("message", (message) => {
  // parentPort.postMessage(`Message from innerWorker: ${message}`);
  console.log(`Message from innerWorker: ${message}`);
});

subWorker.on("error", (error) => {
  parentPort.postMessage(`Error from innerWorker: ${error}`);
});

subWorker.on("exit", (code) => {
  parentPort.postMessage(`innerWorker exited with code: ${code}`);
  Atomics.store(sharedArray, 0, 1);
  Atomics.notify(sharedArray, 0, 1);
});

console.log("SubWorker: Waiting for InnerWorker to finish processing...");
// サブスレッドで内部スレッドの処理を同期的に待つ
Atomics.wait(sharedArray, 0, 0);
console.log("SubWorker: InnerWorker has finished processing.");
