import { getKnexConfig } from "accel-record-core/dist/database";

test("getKnexConfig()", () => {
  {
    // In the case of a string, the default timezone should be set
    const config = getKnexConfig({
      type: "mysql",
      datasourceUrl: "mysql://root:@localhost:3306/accel_test1",
    });
    expect(config).toMatchObject({
      client: "mysql2",
      connection: "mysql://root@localhost:3306/accel_test1?timezone=Z",
    });
  }
  {
    // In the case of a string, the timezone should not be overwritten
    const config = getKnexConfig({
      type: "mysql",
      datasourceUrl: "mysql://root@localhost:3306/accel_test1?timezone=+09:00",
    });
    expect(config).toMatchObject({
      client: "mysql2",
      connection: "mysql://root@localhost:3306/accel_test1?timezone=+09:00",
    });
  }
  {
    // In the case of an object, the default timezone should be set
    const config = getKnexConfig({
      type: "mysql",
      knexConfig: {
        client: "mysql2",
        connection: {
          user: "root",
          password: "",
          host: "localhost",
          port: 3306,
          database: "accel_test1",
        },
      },
    });
    expect(config).toMatchObject({
      client: "mysql2",
      connection: {
        user: "root",
        password: "",
        host: "localhost",
        port: 3306,
        database: "accel_test1",
        timezone: "Z", // default timezone
      },
    });
  }
  {
    // In the case of an object, the timezone should not be overwritten
    const config = getKnexConfig({
      type: "mysql",
      knexConfig: {
        client: "mysql2",
        connection: {
          user: "root",
          password: "",
          host: "localhost",
          port: 3306,
          database: "accel_test1",
          timezone: "+09:00",
        },
      },
    });
    expect(config).toMatchObject({
      client: "mysql2",
      connection: {
        user: "root",
        password: "",
        host: "localhost",
        port: 3306,
        database: "accel_test1",
        timezone: "+09:00",
      },
    });
  }
});
