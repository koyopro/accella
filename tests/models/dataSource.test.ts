import schema from "accel-record/schema";
import { dbConfig } from "../vitest.setup";
import { getDatabaseConfig } from "./index";

const { dataSource, schemaDir } = schema;

test("dataSource", () => {
  switch (dbConfig().type) {
    case "mysql":
      expect(schemaDir).toMatch(new RegExp("/.+/tests/prisma_mysql/"));
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
      break;
    case "sqlite":
      expect(schemaDir).toBe("../prisma/");
      expect(dataSource).toMatchObject({
        name: "db",
        provider: "sqlite",
        activeProvider: "sqlite",
        url: {
          fromEnvVar: "DATABASE_URL",
          value: null,
        },
        schemas: [],
      });
      break;
    case "postgresql":
      expect(schemaDir).toBe("../prisma_pg/");
      expect(dataSource).toMatchObject({
        name: "db",
        provider: "postgresql",
        activeProvider: "postgresql",
        url: {
          fromEnvVar: null,
          value: "postgresql://test:password@localhost:5432/accel_test1",
        },
        schemas: [],
      });
      break;
  }
});

test("getDatabaseConfig()", () => {
  const config = getDatabaseConfig();
  switch (dbConfig().type) {
    case "mysql":
      expect(config).toMatchObject({
        type: "mysql",
        datasourceUrl: "mysql://root:@localhost:3306/accel_test1",
      });
      expect(config.prismaDir).toMatch(new RegExp("/.+/tests/prisma_mysql/"));
      break;
    case "sqlite":
      expect(config).toMatchObject({
        type: "sqlite",
      });
      expect(config.datasourceUrl).toMatch(new RegExp("/.+/tests/prisma/test.db"));
      expect(config.prismaDir).toMatch(new RegExp("/.+/tests/prisma/"));
      break;
    case "postgresql":
      expect(config).toMatchObject({
        type: "postgresql",
        datasourceUrl: "postgresql://test:password@localhost:5432/accel_test1",
      });
      expect(config.prismaDir).toMatch(new RegExp("/.+/tests/prisma_pg/"));
      break;
  }
});
