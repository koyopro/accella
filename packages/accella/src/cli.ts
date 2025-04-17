import { Command } from "commander";
import seed from "./seed.js";

const program = new Command();
program.name("accel").description("Accella CLI tools").version("1.0.0");
program
  .command("db:seed")
  .description("Execute database seeding")
  .option("-f, --filter <filter>", "Specify a filter for the seed file path")
  .action((options) => seed(options));

export { program };
