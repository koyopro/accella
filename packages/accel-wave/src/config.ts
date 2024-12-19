export class Config {
  storeDir = "uploads";
  root = `${process.cwd()}/public`;
  assetHost: string | undefined;
  filename: string | undefined;

  constructor(options?: Partial<Config>) {
    Object.assign(this, options);
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
