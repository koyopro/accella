import {
  Worker,
  parentPort,
  MessageChannel,
  workerData,
  receiveMessageOnPort,
} from "worker_threads";
import { buildSync } from "esbuild";

// eslint-disable-next-line
export const defineThreadSyncActions = (filename, actions) => {
  console.log(filename);
  useAction(actions);
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

      const source = filename;
      const outfile = `${source}.mjs`;
      buildFile(source, outfile);

      worker = new Worker(outfile, {
        workerData: { sharedBuffer, workerPort },
        transferList: [workerPort],
      });
      const ret = {};
      for (const key of Object.keys(actions)) {
        ret[key] = (...args) => {
          worker.postMessage({ method: key, args });
          Atomics.wait(sharedArray, 0, 0);
          const ret = receiveMessageOnPort(mainPort);
          Atomics.store(sharedArray, 0, 0);
          console.log("ret", ret);
          return ret?.message;
        };
      }
      return ret;
    },
  };
};

const useAction = (actions) => {
  // スレッドの処理
  parentPort?.on("message", async (mgs) => {
    const sharedArray = new Int32Array(workerData.sharedBuffer);
    console.log("InnerWorker: Received message from parent.", mgs);
    const ret = await actions[mgs.method]?.(...(mgs.args ?? []));
    console.log("InnerWorker: Send message to parent.", ret);
    workerData.workerPort.postMessage(ret);
    Atomics.store(sharedArray, 0, 1);
    Atomics.notify(sharedArray, 0, 1);
  });
};

let s = 0;
export default defineThreadSyncActions(import.meta.filename, {
  incr: async (a) => a + 1,
  magic: (t) => ++s + t,
  ping: () => "pong!?",
});

function buildFile(filePath, outfile) {
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
