import { DatabaseCleaner, Migration, stopWorker } from "accel-record";
import { runInitializers } from "accella/initialize";

beforeAll(async () => {
  // Run initialization processes, including database setup
  await runInitializers();
  // Run migrations for the test database
  await Migration.migrate();
});

beforeEach(async () => {
  // Start a transaction for the test database
  DatabaseCleaner.start();
});

afterEach(async () => {
  // Roll back the transaction for the test database and discard changes
  DatabaseCleaner.clean();
});

afterAll(async () => {
  // Stop the worker used for database operation synchronization
  stopWorker();
});
