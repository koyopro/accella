import path from "path";
import { runScript } from "./cli.js";
import { program } from "./cli2.js";

program
  .command("run")
  .description("Run a TypeScript file")
  .argument("<file>", "Path to the TypeScript file")
  .action(async (file) => {
    await runScript(path.resolve(process.cwd(), file));
  });

program
  .command("db:seed")
  .description("Run database seeding")
  .action(async () => {
    const file = path.resolve(path.dirname(import.meta.url.replace("file:", "")), "seed.js");
    await runScript(file);
  });
