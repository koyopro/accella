import { initAccelRecord, Migration, Model } from "accel-record";
import assert from "assert";
import { getDatabaseConfig } from "../tests/models/index.js";

const subject = async () => Migration.hasPendingMigrations();

const setup = async () => {
  await initAccelRecord({
    ...getDatabaseConfig(),
    datasourceUrl: `mysql://root:@localhost:3306/test_migrations`,
  });
};

export default async () => {
  await setup();

  // Scenario 1: The database does not exist
  Model.connection.execute("drop database if exists test_migrations", []);
  assert.equal(await subject(), true);

  // Scenario 2: The database exists but the log table does not
  await Migration.ensureDatabaseExists();
  assert.equal(await subject(), true);

  // Scenario 3: There are pending migrations
  await Migration.migrate({ step: 3 });
  assert.equal(await subject(), true);

  // Scenario 4: All migrations have been applied
  await Migration.migrate();
  assert.equal(await subject(), false);
};
