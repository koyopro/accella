import { deepMerge, type DeepPartial } from "./lib/deepMerge.js";
import { FileStorage } from "./storages/file.js";
import { type Storage } from "./storages/index.js";

export type ConfigOptions = DeepPartial<Config>;

export class Config {
  constructor(options?: ConfigOptions) {
    const defalutValues = {
      storage: FileStorage,
      storeDir: "uploads",
      root: `${process.cwd()}/public`,
    };
    deepMerge(Config.prototype, Object.assign(defalutValues, globalConfig));
    deepMerge(this, options);
  }
}

declare module "." {
  interface Config {
    storage: new (config: Config) => Storage;
    storeDir: string;
    root: string;
    assetHost: string | undefined;
  }
}

export let globalConfig: ConfigOptions = {};

export const configureAccelWave = (config: ConfigOptions) => {
  globalConfig = config;
};
