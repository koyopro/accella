import { DatabaseCleaner, Migration, stopWorker } from "accel-record";
import setupDatabase from "src/config/initializers/database";

beforeAll(async () => {
  await setupDatabase();
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
