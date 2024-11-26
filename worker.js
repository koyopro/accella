import {
  Worker,
  parentPort,
  MessageChannel,
  workerData,
  receiveMessageOnPort,
} from "worker_threads";

// const s = 0;

// eslint-disable-next-line
export const defineThreadSyncActions = (filename) => {
  console.log(filename);
  let worker = null;
  return {
    stop: () => {
      worker?.terminate();
      worker = null;
    },
    launch: () => {
      const sharedBuffer = new SharedArrayBuffer(4);
      const sharedArray = new Int32Array(sharedBuffer);
      const { port1: mainPort, port2: workerPort } = new MessageChannel();
      worker = new Worker(filename, {
        workerData: { sharedBuffer, workerPort },
        transferList: [workerPort],
      });
      return {
        ping: () => {
          worker.postMessage({ method: "ping" });
          Atomics.wait(sharedArray, 0, 0);
          const ret = receiveMessageOnPort(mainPort)?.message;
          return ret;
        },
        // incr: (a) => a + 1,
        // magic: (t) => ++s + t,
      };
    },
  };
};

// 内部スレッドの処理
parentPort?.on("message", async (mgs) => {
  const sharedArray = new Int32Array(workerData.sharedBuffer);
  console.log("InnerWorker: Received message from parent.", mgs);
  await new Promise((r) => setTimeout(r, 300));
  workerData.workerPort.postMessage("pong!!!");
  const value = 3;
  Atomics.store(sharedArray, 0, value);
  Atomics.notify(sharedArray, 0, 1);
});

export default defineThreadSyncActions(import.meta.filename);
