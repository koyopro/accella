import actions from "./worker.js";

const client = actions.launch();

console.log(client.ping());
console.log(client.incr(3));

actions.stop();
