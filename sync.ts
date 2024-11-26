import actions from "./worker";

const client = actions.launch();

console.log(client.ping());
console.log(client.incr(3));
console.log(client.magic(0));
console.log(client.magic(1));
console.log(client.magic(2));

setTimeout(() => {
  actions.stop();
}, 100);
// actions.stop();
