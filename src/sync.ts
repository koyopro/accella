import actions from "./worker.js";

const client = actions.launch();

console.log(client());
console.log(client({ method: "ping" }));
console.log(client({ method: "incr", args: [3] }));

actions.stop();
