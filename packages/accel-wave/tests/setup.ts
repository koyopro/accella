import { worker } from "src/worker";

afterAll(() => {
  worker.terminate();
});
