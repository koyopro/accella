import { ViteUserConfig } from "astro";
import { getViteConfig } from "astro/config";
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import { createServer } from "vite";

const createViteServer = async (config: ViteUserConfig) => {
  const viteConfig = await getViteConfig(config)({ command: "serve", mode: "development" });
  const vite = await createServer(viteConfig as any);
  return vite;
};

async function runScript(filepath: string): Promise<void> {
  try {
    await fs.access(filepath);

    const vite = await createViteServer({});

    try {
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
    } finally {
      await vite.close();
    }
  } catch (error) {
    console.error(`File execution error: ${filepath}`);
    console.error(error);
    process.exit(1);
  }
}

export async function cli() {
  const program = new Command();

  program.name("accel").description("Accella CLI tools").version("1.0.0");

  program
    .command("run")
    .description("Run a TypeScript file")
    .argument("<file>", "Path to the TypeScript file")
    .action(async (file) => {
      await runScript(path.resolve(process.cwd(), file));
      process.exit(0);
    });

  program
    .command("db:seed")
    .description("Run database seeding")
    .action(async () => {
      const file = path.resolve(path.dirname(import.meta.url.replace("file:", "")), "seed.js");
      await runScript(file);
      process.exit(0);
    });

  program.parse();
}
