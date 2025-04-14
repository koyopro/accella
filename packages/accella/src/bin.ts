#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import path from "path";
import { runScript } from "./vite.js";

async function command() {
  const program = await getProgram();
  registerRunCommand(program);
  await importTasks();
  await program.parseAsync();
  process.exit(0);
}

async function getProgram(): Promise<Command> {
  const cli = await runScript(
    path.resolve(path.dirname(import.meta.url.replace("file:", "")), "cli.js")
  );
  return cli.program;
}

function registerRunCommand(program: any) {
  program
    .command("run")
    .description("Run a TypeScript file")
    .argument("<file>", "Path to the TypeScript file")
    .action(async (file: any) => {
      await runScript(path.resolve(process.cwd(), file));
    });
}

async function importTasks() {
  const tasksDir = path.join(process.cwd(), "src/commands");
  if (fs.existsSync(tasksDir)) {
    const files = fs.readdirSync(tasksDir);
    const tsFiles = files.filter((file) => /(ts|js)$/.test(file));
    for (const file of tsFiles) {
      const filepath = path.resolve(tasksDir, file);
      await runScript(filepath);
    }
  }
}

await command();
