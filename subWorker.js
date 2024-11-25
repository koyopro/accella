// subWorker.js
// const { Worker, parentPort } = require('worker_threads');
import fs from "fs";
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

// 内部スレッドを起動した後にファイルを渡す
// const filePath = path.resolve("CONTRIBUTING.md");
fs.readFile("./CONTRIBUTING.md", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  console.log(buffer);
  subWorker.postMessage(buffer, [buffer]);
  console.log("File sent to innerWorker.");
  console.log(buffer);

  console.log("SubWorker: Waiting for InnerWorker to finish processing...");
  // サブスレッドで内部スレッドの処理を同期的に待つ
  Atomics.wait(sharedArray, 0, 0);
  console.log("SubWorker: InnerWorker has finished processing.");

  subWorker.terminate();
});
