import { program } from "./cli2.js";

console.log("len", program.commands.length);

program.parse();
