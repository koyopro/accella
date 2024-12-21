import { deepMerge, type DeepPartial } from "./lib/deepMerge.js";
import { FileStorage } from "./storages/file.js";
import { type Storage } from "./storages/index.js";

export class Config {
  constructor(options?: DeepPartial<Config>) {
    deepMerge(this, globalConfig);
    deepMerge(this, options);

    // Default values
    this.storage ??= FileStorage;
    this.storeDir ??= "uploads";
    this.root ??= `${process.cwd()}/public`;
  }
}

declare module "." {
  interface Config {
    storage: new (config: Config) => Storage;
    storeDir: string;
    root: string;
    assetHost: string | undefined;
    filename: string | undefined;
  }
}

export let globalConfig: DeepPartial<Config> = {};

export const configureAccelWave = (config: DeepPartial<Config>) => {
  globalConfig = config;
};
