import { Model } from "accel-record";
import { program } from "accella";

program
  .command("hello")
  .description("Prints a hello message")
  .action(() => {
    console.log("Hello, world!");
    console.log(Model.connection.adapterName);
  });

console.log(program.commands.length);
