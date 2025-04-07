import { ViteUserConfig } from "astro";
import { getViteConfig } from "astro/config";
import { program } from "commander";
import fs from "fs/promises";
import path from "path";
import { createServer } from "vite";

let viteServer: Awaited<ReturnType<typeof createServer>> | null = null;

const createViteServer = async (config: ViteUserConfig) => {
  if (viteServer) {
    return viteServer;
  }

  const viteConfig = await getViteConfig(config)({ command: "serve", mode: "development" });
  viteServer = await createServer(viteConfig as any);
  return viteServer;
};

const closeViteServer = async () => {
  if (viteServer) {
    await viteServer.close();
    viteServer = null;
  }
};

process.on("SIGINT", async () => {
  await closeViteServer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeViteServer();
  process.exit(0);
});

async function runScript(filepath: string): Promise<void> {
  try {
    await fs.access(filepath);

    const vite = await createViteServer({});

    const initializeModule = await vite.ssrLoadModule(
      path.resolve(path.dirname(import.meta.url.replace("file:", "")), "initialize.js")
    );
    await initializeModule.runInitializers();

    const module = await vite.ssrLoadModule(filepath);

    if (typeof module.default === "function") {
      await module.default();
    } else if (typeof module.main === "function") {
      await module.main();
    }
  } catch (error) {
    console.error(`File execution error: ${filepath}`);
    console.error(error);
    throw error;
  }
}

program
  .command("run")
  .description("Run a TypeScript file")
  .argument("<file>", "Path to the TypeScript file")
  .action(async (file) => {
    await runScript(path.resolve(process.cwd(), file));
    await closeViteServer();
    process.exit(0);
  });

program
  .command("db:seed")
  .description("Run database seeding")
  .action(async () => {
    const file = path.resolve(path.dirname(import.meta.url.replace("file:", "")), "seed.js");
    await runScript(file);
    await closeViteServer();
    process.exit(0);
  });

program.name("accel").description("Accella CLI tools").version("1.0.0");

export { closeViteServer, program, runScript };
