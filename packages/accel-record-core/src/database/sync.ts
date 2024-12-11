import { getKnexConfig, LogLevel } from "../database.js";
import { client } from "../synclib/worker.js";
// @ts-ignore
import SyncRpc, { stop } from "../sync-rpc/index.js";

export const buildSyncClient = (): SyncClient => {
  return canSyncActions() ? new ThreadSyncClient() : new ProcessSyncClient();
};

export interface SyncClient {
  launchWorker(params: { knexConfig: ReturnType<typeof getKnexConfig> }): void;
  execSQL(params: { sql: string; bindings: readonly any[]; logLevel?: LogLevel }): any;
  stopWorker(): void;
}

export class ProcessSyncClient implements SyncClient {
  private _rpc: any;
  launchWorker(params: { knexConfig: ReturnType<typeof getKnexConfig> }): void {
    if (this._rpc) return;
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
  private _rpc: ReturnType<typeof client.launch> | undefined;

  launchWorker(params: { knexConfig: ReturnType<typeof getKnexConfig> }): void {
    if (this._rpc) return;
    this._rpc = client.launch();
    this._rpc.init(params);
  }
  execSQL(params: { sql: string; bindings: readonly any[]; logLevel?: LogLevel }): any {
    return this._rpc?.execSQL(params);
  }
  stopWorker() {
    client.stopWorker();
  }
}

const canSyncActions = () => {
  const v = Number(process.versions?.node?.split(".")?.[0]);
  return isFinite(v) ? v >= 22 : false;
};
