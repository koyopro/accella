import { program } from "accella";
import { Account } from "../models";

program
  .command("hello")
  .description("Hello command")
  .action(() => {
    console.log("Hello from Accella!");
    const count = Account.count();
    console.log(`Total accounts: ${count}`);
  });
