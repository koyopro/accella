// innerWorker.js
import { parentPort, workerData } from "worker_threads";

const sharedArray = new Int32Array(workerData.sharedBuffer);
const workerPort = workerData.workerPort;

// 内部スレッドの処理
parentPort.on("message", (buffer) => {
  const data = new Uint8Array(buffer);
  const fileContent = Buffer.from(data).toString();
  console.log("InnerWorker: Received file content:", fileContent[0]);

  setTimeout(() => {
    const response = { message: "Hello from innerWorker" };

    workerPort.postMessage(response);

    const value = 3;
    Atomics.store(sharedArray, 0, value);
    Atomics.notify(sharedArray, 0, 1);
    parentPort.postMessage(`InnerWorker: send data size: ${value}`);
    Atomics.wait(sharedArray, 0, value);
    parentPort.postMessage(`InnerWorker: value from parent is ${sharedArray[0]}`);
    Atomics.store(sharedArray, 0, value);
    Atomics.notify(sharedArray, 0, 1);
  }, 1);
});
