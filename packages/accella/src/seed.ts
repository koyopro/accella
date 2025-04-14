async function runCommonSeeds() {
  const modules = import.meta.glob("/db/seed/*.{js,ts}");
  for (const path in modules) {
    console.log(`== Seed from ${path}`);
    await modules[path]();
  }
}

async function runEnvironmentSpecificSeeds() {
  const currentEnv = process.env.NODE_ENV || "development";
  const allEnvModules = import.meta.glob("/db/seed/**/*.{js,ts}");
  const envPattern = `/db/seed/${currentEnv}/`;

  for (const path in allEnvModules) {
    if (path.startsWith(envPattern)) {
      console.log(`== Seed from ${path} [${currentEnv}]`);
      await allEnvModules[path]();
    }
  }
}

export default async () => {
  await runCommonSeeds();
  await runEnvironmentSpecificSeeds();
};
