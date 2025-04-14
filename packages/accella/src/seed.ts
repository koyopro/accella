async function runCommonSeeds() {
  const modules = import.meta.glob("/db/seed/*.{js,ts}");
  for (const path in modules) {
    seedLog(`== Seed from ${path}`);
    await modules[path]();
  }
}

async function runEnvironmentSpecificSeeds() {
  const currentEnv = process.env.NODE_ENV || "development";
  const allEnvModules = import.meta.glob("/db/seed/**/*.{js,ts}");
  const envPattern = `/db/seed/${currentEnv}/`;

  for (const path in allEnvModules) {
    if (path.startsWith(envPattern)) {
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

export default async () => {
  await runCommonSeeds();
  await runEnvironmentSpecificSeeds();
};
