import { ViteUserConfig } from "astro";
import { getViteConfig } from "astro/config";
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

  const initializeModule = await viteServer.ssrLoadModule(
    path.resolve(path.dirname(import.meta.url.replace("file:", "")), "initialize.js")
  );
  await initializeModule.runInitializers();

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

async function runScript(filepath: string): Promise<any> {
  try {
    await fs.access(filepath);

    const vite = await createViteServer({});

    const module = await vite.ssrLoadModule(filepath);

    if (typeof module.default === "function") {
      await module.default();
    } else if (typeof module.main === "function") {
      await module.main();
    }
    return module;
  } catch (error) {
    console.error(`File execution error: ${filepath}`);
    console.error(error);
    throw error;
  }
}

export { closeViteServer, runScript };
