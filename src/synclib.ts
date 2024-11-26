import {
  Worker,
  parentPort,
  MessageChannel,
  MessagePort,
  workerData,
  receiveMessageOnPort,
} from "worker_threads";
import { buildSync } from "esbuild";

export type Actions = Record<string, (...args: any[]) => any>;
type AwaitedFunc<F extends Actions, K extends keyof F> = (
  ...args: Parameters<F[K]>
) => Awaited<ReturnType<F[K]>>;

export const defineThreadSyncActions = <F extends Actions>(filename: string, actions: F) => {
  console.log(filename);
  useAction(actions);
  let worker: Worker | null = null;
  return {
    stop: () => {
      worker?.terminate();
      worker = null;
    },

    launch: (): { [K in keyof F]: AwaitedFunc<F, K> } => {
      const sharedBuffer = new SharedArrayBuffer(4);
      const { port1: mainPort, port2: workerPort } = new MessageChannel();

      const outfile = `${filename}.mjs`;
      buildFile(filename, outfile);

      worker = new Worker(outfile, {
        workerData: { sharedBuffer, workerPort },
        transferList: [workerPort],
      });
      return buildClient(actions, worker, sharedBuffer, mainPort);
    },
  };
};

const buildClient = (
  actions: Actions,
  worker: Worker,
  sharedBuffer: SharedArrayBuffer,
  mainPort: MessagePort
) => {
  const sharedArray = new Int32Array(sharedBuffer);
  const ret: any = {};
  for (const key of Object.keys(actions)) {
    ret[key] = (...args: any) => {
      worker?.postMessage({ method: key, args });
      Atomics.wait(sharedArray, 0, 0);
      const ret = receiveMessageOnPort(mainPort);
      Atomics.store(sharedArray, 0, 0);
      console.log("ret", ret);
      return ret?.message;
    };
  }
  return ret;
};

const useAction = (actions: Actions) => {
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
