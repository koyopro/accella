import { getKnexConfig, LogLevel } from "../database.js";
import { sync } from "../synclib/worker.js";
// @ts-ignore
import SyncRpc, { stop } from "../sync-rpc/index.js";

export const buildSyncClient = (
  type: "thread" | "process",
  params: { knexConfig: ReturnType<typeof getKnexConfig> }
): SyncClient => {
  return type == "process" ? new ProcessSyncClient(params) : new ThreadSyncClient(params);
};

export interface SyncClient {
  execSQL(params: { sql: string; bindings: readonly any[]; logLevel?: LogLevel }): any;
  stopWorker(): void;
}

export class ProcessSyncClient implements SyncClient {
  private _rpc: any;
  constructor(params: { knexConfig: ReturnType<typeof getKnexConfig> }) {
    this._rpc = SyncRpc(new URL("../worker.cjs", import.meta.url).pathname, params);
  }
  execSQL(params: { sql: string; bindings: readonly any[]; logLevel?: LogLevel }): any {
    return this._rpc(params);
  }
  stopWorker() {
    stop();
  }
}

export class ThreadSyncClient implements SyncClient {
  private _rpc: ReturnType<typeof sync.launch>;

  constructor(params: { knexConfig: ReturnType<typeof getKnexConfig> }) {
    this._rpc = sync.launch();
    this._rpc.actions.init(params);
  }
  execSQL(params: { sql: string; bindings: readonly any[]; logLevel?: LogLevel }): any {
    return this._rpc?.actions?.execSQL(params);
  }
  stopWorker() {
    this._rpc?.worker.terminate();
  }
}
