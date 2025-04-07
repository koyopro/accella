#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { program } from "./cli.js";

const tasksDir = path.join(process.cwd(), "src/tasks");

async function importTaskFiles() {
  if (fs.existsSync(tasksDir)) {
    const files = fs.readdirSync(tasksDir).filter((file) => /\.(js|mjs|cjs)$/.test(file));

    for (const file of files) {
      const filepath = path.resolve(tasksDir, file);
      await import(filepath);
    }
  }
}

await importTaskFiles();

program.parse();
