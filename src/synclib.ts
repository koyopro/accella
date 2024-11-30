import { buildSync } from "esbuild";
import fs from "fs";
import path from "path";
import {
  MessageChannel,
  MessagePort,
  Worker,
  parentPort,
  receiveMessageOnPort,
  workerData,
} from "worker_threads";

export type Actions = Record<string, (...args: any[]) => any>;
type AwaitedFunc<F extends Actions, K extends keyof F> = (
  ...args: Parameters<F[K]>
) => Awaited<ReturnType<F[K]>>;
export type Client<F extends Actions> = { [K in keyof F]: AwaitedFunc<F, K> };

const isSubThread = typeof workerData.sharedBuffer !== "undefined";

export const launchSyncWorker = <F extends Actions>(filename: string, actions: F) => {
  const client = defineThreadSyncActions(filename, actions);
  const launchedActions = client.launch();
  return {
    actions: launchedActions,
    stop: client.stop,
    getWorker: client.getWorker,
  };
};

export const defineThreadSyncActions = <F extends Actions>(filename: string, actions: F) => {
  useAction(actions);
  // Parent thread
  let worker: Worker | null = null;
  return {
    stop: () => {
      worker?.terminate();
      worker = null;
    },

    launch: (): Client<F> => {
      if (isSubThread) return {} as any;

      const sharedBuffer = new SharedArrayBuffer(4);
      const { port1: mainPort, port2: workerPort } = new MessageChannel();

      const tmpfile = makeTmpFileName(filename);
      buildFile(filename, tmpfile);

      worker = new Worker(tmpfile, {
        workerData: { sharedBuffer, workerPort },
        transferList: [workerPort],
      });
      addListenerForRemovingTmpFile(worker, tmpfile);
      return buildClient(worker, sharedBuffer, mainPort) as any;
    },

    getWorker: () => worker,
  };
};

const makeTmpFileName = (filename: string) => {
  return path.join(path.dirname(filename), `._${path.basename(filename)}.mjs`);
};

const addListenerForRemovingTmpFile = (worker: Worker, outfile: string) => {
  const confirmRemoveTmpFile = () => {
    if (fs.existsSync(outfile)) fs.unlinkSync(outfile);
  };
  worker.once("error", () => {
    confirmRemoveTmpFile();
  });
  worker.once("message", (msg) => {
    if (msg === "ready") {
      confirmRemoveTmpFile();
    }
  });
};

const buildClient = (worker: Worker, sharedBuffer: SharedArrayBuffer, mainPort: MessagePort) => {
  const sharedArray = new Int32Array(sharedBuffer);
  return new Proxy(
    {},
    {
      get: (_, key: string) => {
        return (...args: any) => {
          worker.postMessage({ method: key, args });
          Atomics.wait(sharedArray, 0, 0);
          const { result, error, properties } = receiveMessageOnPort(mainPort)?.message || {};
          Atomics.store(sharedArray, 0, 0);
          if (error) {
            throw Object.assign(error as object, properties);
          }
          return result;
        };
      },
    }
  );
};

const useAction = (actions: Actions) => {
  if (!isSubThread) return;

  parentPort?.on("message", async (mgs) => {
    const sharedArray = new Int32Array(workerData.sharedBuffer);
    try {
      const ret = await actions[mgs.method]?.(...(mgs.args ?? []));
      workerData.workerPort.postMessage({ result: ret });
    } catch (e) {
      workerData.workerPort.postMessage({ error: e, properties: extractProperties(e) });
    }
    Atomics.store(sharedArray, 0, 1);
    Atomics.notify(sharedArray, 0, 1);
  });
  parentPort?.postMessage("ready");
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

// MessagePort doesn't copy the properties of Error objects. We still want
// error objects to have extra properties such as "warnings" so implement the
// property copying manually.
export function extractProperties<T extends object>(object: T): T;
export function extractProperties<T>(object?: T): T | undefined;
export function extractProperties<T>(object?: T) {
  if (object && typeof object === "object") {
    const properties = {} as T;
    for (const key in object) {
      properties[key as keyof T] = object[key];
    }
    return properties;
  }
}
