export type Options = {
  filter?: string;
  quiet?: boolean;
};

async function runCommonSeeds(options: Options) {
  const modules = import.meta.glob("/db/seed/*.{js,ts}");
  for (const path in modules) {
    if (options.filter && !path.includes(options.filter)) continue;
    seedLog(`== Seed from ${path}`);
    await modules[path]();
  }
}

async function runEnvironmentSpecificSeeds(options: Options) {
  const currentEnv = process.env.NODE_ENV || "development";
  const allEnvModules = import.meta.glob("/db/seed/**/*.{js,ts}");
  const envPattern = `/db/seed/${currentEnv}/`;

  for (const path in allEnvModules) {
    if (path.startsWith(envPattern)) {
      if (options.filter && !path.includes(options.filter)) continue;
      seedLog(`== Seed from ${path} [${currentEnv}]`);
      await allEnvModules[path]();
    }
  }
}

const seedLog = (...args: any[]) => {
  if (process.env.SEED_QUIET) return;
  if (process.env.NODE_ENV === "test") return;
  console.log(...args);
};

export default async (options: Options) => {
  if (options.quiet) process.env.SEED_QUIET = "1";
  await runCommonSeeds(options);
  await runEnvironmentSpecificSeeds(options);
};
