import assert from "assert";
import { execSync } from "child_process";
import { existsSync } from "fs";

const migrate = async (schema: string, db: string) => {
  process.env.DATABASE_URL = db;
  execSync(`npx prisma migrate deploy --schema=${schema}`, {
    stdio: "ignore",
    env: process.env,
  });
  execSync(`npx prisma generate --schema=${schema}`, {
    stdio: "ignore",
    env: process.env,
  });
};

(async () => {
  {
    await migrate("tests/check/schema1.prisma", "file:./test1.db");
    // @ts-ignore
    const { getDatabaseConfig } = await import("../tests/check/models1/index");
    const config = getDatabaseConfig();
    assert(config.datasourceUrl.endsWith("/tests/check/test1.db"));
    assert(existsSync(config.datasourceUrl));
  }

  {
    await migrate("tests/check/schema2.prisma", "file:./test2.db");
    // @ts-ignore
    const { getDatabaseConfig } = await import("../tests/check/models1/index");
    const config = getDatabaseConfig();
    assert(config.datasourceUrl.endsWith("/tests/check/test2.db"));
    assert(existsSync(config.datasourceUrl));
  }

  {
    await migrate("tests/check/schema3/main.prisma", "file:./test3.db");
    // @ts-ignore
    const { getDatabaseConfig } = await import("../tests/check/models3/index");
    const config = getDatabaseConfig();
    assert(config.datasourceUrl.endsWith("/tests/check/schema3/test3.db"));
    assert(existsSync(config.datasourceUrl));
  }
  process.exit(0);
})();
