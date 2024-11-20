import { getDatabaseConfig, dataSource } from "./index";

test("dataSource", () => {
  expect(dataSource).toMatchObject({
    name: "db",
    provider: "mysql",
    activeProvider: "mysql",
    url: {
      fromEnvVar: null,
      value: "mysql://root:@localhost:3306/accel_test1",
    },
    schemas: [],
  });
});

test("getDatabaseConfig()", () => {
  const dbConfig = getDatabaseConfig();
  expect(dbConfig).toMatchObject({
    type: "mysql",
    datasourceUrl: "mysql://root:@localhost:3306/accel_test1",
  });
});
