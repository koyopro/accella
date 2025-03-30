import { ViteUserConfig } from "astro";
import { getViteConfig } from "astro/config";
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
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: accel run <path to ts file>");
    process.exit(1);
  }

  const command = args[0];

  if (command === "run" && args[1]) {
    await runScript(path.resolve(process.cwd(), args[1]));
    process.exit(0);
  } else {
    console.error("Usage: accel run <path to ts file>");
    process.exit(1);
  }
}
