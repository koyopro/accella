#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { program, runScript, closeViteServer } from "./cli.js";

async function importTaskFiles() {
  const tasksDir = path.join(process.cwd(), "src/tasks");
  if (fs.existsSync(tasksDir)) {
    const files = fs.readdirSync(tasksDir);
    const tsFiles = files.filter((file) => /(ts|js)$/.test(file));
    for (const file of tsFiles) {
      const filepath = path.resolve(tasksDir, file);
      await runScript(filepath);
    }
  }
  await closeViteServer();
}

await importTaskFiles();

program.parse();
