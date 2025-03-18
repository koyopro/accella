import { deepMerge, type DeepPartial } from "./lib/deepMerge.js";
import { FileStorage } from "./storages/file.js";
import { type Storage } from "./storages/index.js";

export type ConfigOptions = DeepPartial<Config>;

/**
 * Represents the configuration settings for the application.
 *
 * @remarks
 * This class allows for the configuration of storage options, directory paths, and root paths.
 * It merges default values with global configuration and provided options.
 *
 * @param options - Optional configuration settings to override default values.
 *
 * @example
 * ```typescript
 * const config = new Config({
 *   storage: CustomStorage,
 *   storeDir: "custom_uploads",
 *   root: "/custom/path"
 * });
 * ```
 */
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
    /**
     * A constructor for the Storage class.
     *
     * @default FileStorage
     */
    readonly storage: new (config: Config) => Storage;
    /**
     * The directory where the store is located.
     *
     * @default "uploads"
     */
    readonly storeDir: string;
    /**
     * The root directory for the configuration.
     *
     * @default `${process.cwd()}/public`
     */
    readonly root: string;
    /**
     * The host for assets.
     *
     * @default undefined
     */
    readonly assetHost: string | undefined;
  }
}

let globalConfig: ConfigOptions = {};

/**
 * Configures the global settings for AccelWave.
 *
 * @param config - The configuration options to set.
 */
export const configureAccelWave = (config: ConfigOptions) => {
  globalConfig = config;
};
