import { deepMerge, type DeepPartial } from "./lib/deepMerge.js";
import { FileStorage } from "./storages/file.js";
import { type Storage } from "./storages/index.js";

export class Config {
  storage: new (config: Config) => Storage = FileStorage;
  storeDir = "uploads";
  root = `${process.cwd()}/public`;
  assetHost: string | undefined;
  filename: string | undefined;

  constructor(options?: DeepPartial<Config>) {
    deepMerge(this, globalConfig);
    deepMerge(this, options);
  }
}

export let globalConfig: DeepPartial<Config> = {};

export const configureAccelWave = (config: DeepPartial<Config>) => {
  globalConfig = config;
};
