// innerWorker.js
// const { parentPort, workerData } = require('worker_threads');
import { parentPort, workerData } from "worker_threads";

const sharedArray = new Int32Array(workerData.sharedBuffer);
const responseArray = new Uint8Array(workerData.responseBuffer);

// 内部スレッドの処理

parentPort.on("message", (buffer) => {
  // console.log(buffer);
  const data = new Uint8Array(buffer);
  const fileContent = Buffer.from(data).toString();
  console.log("InnerWorker: Received file content:", fileContent[0]);

  // // 内部スレッドの処理
  // setTimeout(() => {
  //   parentPort.postMessage('Hello from innerWorker');
  // }, 1000);
  setTimeout(() => {
    const response = { message: "Hello from innerWorker" };
    const responseJson = JSON.stringify(response);
    new TextEncoder().encodeInto(responseJson, responseArray);

    const value = responseJson.length;
    Atomics.store(sharedArray, 0, value);
    Atomics.notify(sharedArray, 0, 1);
    parentPort.postMessage(`InnerWorker: send data size: ${value}`);
    Atomics.wait(sharedArray, 0, value);
    parentPort.postMessage(`InnerWorker: value from parent is ${sharedArray[0]}`);
    Atomics.store(sharedArray, 0, value);
    Atomics.notify(sharedArray, 0, 1);
  }, 1);
});
