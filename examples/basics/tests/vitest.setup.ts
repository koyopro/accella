import { DatabaseCleaner, Migration, stopWorker } from "accel-record";
import { runInitializers } from "accella/initialize";

beforeAll(async () => {
  await runInitializers();
  await Migration.migrate();
});

beforeEach(async () => {
  DatabaseCleaner.start();
});

afterEach(async () => {
  DatabaseCleaner.clean();
});

afterAll(async () => {
  stopWorker();
});
