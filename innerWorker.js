// innerWorker.js
// const { parentPort, workerData } = require('worker_threads');
import { parentPort, workerData } from "worker_threads";

const sharedArray = new Int32Array(workerData.sharedBuffer);

// 内部スレッドの処理
setTimeout(() => {
  parentPort.postMessage("Hello from innerWorker");
  Atomics.store(sharedArray, 0, 1);
  Atomics.notify(sharedArray, 0, 1);
}, 1000);
