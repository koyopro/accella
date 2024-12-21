import { deepMerge, type DeepPartial } from "./lib/deepMerge.js";

export class Config {
  storeDir = "uploads";
  root = `${process.cwd()}/public`;
  assetHost: string | undefined;
  filename: string | undefined;

  constructor(options?: DeepPartial<Config>) {
    deepMerge(this, globalConfig);
    deepMerge(this, options);
  }
}

declare module "./config.js" {
  interface Config {
    s3:
      | {
          region: string;
          bucket: string;
        }
      | undefined;
  }
}

export let globalConfig: DeepPartial<Config> = {};

export const configureAccelWave = (config: DeepPartial<Config>) => {
  globalConfig = config;
};
