#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { runScript, closeViteServer } from "./cli.js";
import { program } from "./cli2.js";

async function importTaskFiles() {
  const cli2 = await runScript(
    path.resolve(path.dirname(import.meta.url.replace("file:", "")), "cli2.js")
  );
  console.log("cli2", cli2.program.commands.length);
  const program = cli2.program;
  program
    .command("run")
    .description("Run a TypeScript file")
    .argument("<file>", "Path to the TypeScript file")
    .action(async (file: any) => {
      await runScript(path.resolve(process.cwd(), file));
      process.exit(0);
    });
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
  console.log("cli2", cli2.program.commands.length);
  await runScript(path.resolve(path.dirname(import.meta.url.replace("file:", "")), "run.js"));
  // console.log(program.commands.length);
  // await closeViteServer();
  // process.exit(0);
}

await importTaskFiles();
