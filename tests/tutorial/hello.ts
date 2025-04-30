import { program } from "accella/cli";

program
  .command("hello")
  .description("Hello command")
  .action(() => console.log("Hello from Accella!"));
