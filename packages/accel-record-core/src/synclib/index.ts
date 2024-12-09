import { createHash } from "crypto";
import { buildSync } from "esbuild";
import { type FileHandle } from "fs/promises";
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

const isSubThread = workerData?.subThreadForSync === true;

export const launchSyncWorker = <F extends Actions>(filename: string, actions: F) => {
  const { launch, ...client } = defineSyncWorker(filename, actions);
  return {
    actions: launch(),
    ...client,
  };
};

export const defineSyncWorker = <F extends Actions>(filename: string, actions: F) => {
  useAction(actions);
  // Parent thread
  let worker: Worker | null = null;
  return {
    launch: (): Client<F> => {
      if (isSubThread) return {} as any;

      const sharedBuffer = new SharedArrayBuffer(4);
      const { port1: mainPort, port2: workerPort } = new MessageChannel();

      const tmpfile = makeTmpFilePath(filename);
      buildFile(filename, tmpfile);

      worker = new Worker(tmpfile, {
        workerData: { sharedBuffer, workerPort, subThreadForSync: true },
        transferList: [workerPort],
      });
      return buildClient(worker, sharedBuffer, mainPort) as any;
    },

    stopWorker: () => {
      worker?.terminate();
      worker = null;
    },

    getWorker: () => worker,
  };
};

const makeTmpFilePath = (filename: string) => {
  const md5 = createHash("md5").update(filename).digest("hex");
  return path.resolve(
    process.cwd(),
    "node_modules",
    `.sync-action-workers/${path.basename(filename)}_${md5}.mjs`
  );
};

const buildClient = (worker: Worker, sharedBuffer: SharedArrayBuffer, mainPort: MessagePort) => {
  const sharedArray = new Int32Array(sharedBuffer);
  return new Proxy(
    {},
    {
      get: (_, key: string) => {
        return (...args: any) => {
          const transferList = args.filter((arg: any) => isTransferable(arg));
          worker.postMessage({ method: key, args }, transferList);
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
      const transferList = isTransferable(ret) ? [ret] : [];
      workerData.workerPort.postMessage({ result: ret }, transferList);
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

const isTransferable = (obj: any): boolean => {
  return (
    obj instanceof ArrayBuffer ||
    obj instanceof MessagePort ||
    // obj instanceof Blob ||
    isFileHandle(obj)
  );
};

function isFileHandle(obj: any): obj is FileHandle {
  return (
    obj && typeof obj === "object" && typeof obj.fd === "number" && typeof obj.read === "function"
  );
}
