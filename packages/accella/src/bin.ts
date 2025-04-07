#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { runScript, closeViteServer } from "./cli.js";

async function importTaskFiles() {
  await runScript(path.resolve(path.dirname(import.meta.url.replace("file:", "")), "cli3.js"));
  const tasksDir = path.join(process.cwd(), "src/tasks");
  if (fs.existsSync(tasksDir)) {
    const files = fs.readdirSync(tasksDir);
    const tsFiles = files.filter((file) => /(ts|js)$/.test(file));
    for (const file of tsFiles) {
      const filepath = path.resolve(tasksDir, file);
      console.log(`Importing task file: ${filepath}`);
      await runScript(filepath);
    }
  }
  await runScript(path.resolve(path.dirname(import.meta.url.replace("file:", "")), "run.js"));
  await closeViteServer();
}

await importTaskFiles();
