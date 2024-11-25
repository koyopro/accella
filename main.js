// main.js
// const { Worker } = require("worker_threads");
import { Worker } from "worker_threads";

const worker = new Worker("./subWorker.js");

worker.on("message", (message) => {
  console.log(message);
});

worker.on("error", (error) => {
  console.error("Error from subWorker:", error);
});

worker.on("exit", (code) => {
  console.log("subWorker exited with code:", code);
});
