import { program } from "./cli2.js";
import seed from "./seed.js";

program
  .command("db:seed")
  .description("Run database seeding")
  .action(async () => {
    await seed();
    process.exit(0);
  });
