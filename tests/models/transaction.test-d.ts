import { Model } from "accel-record";

describe("Transaction", () => {
  test(".transaction()", () => {
    {
      const result = Model.transaction(() => {});
      expectTypeOf(result).toEqualTypeOf<void | undefined>();
    }
    {
      const result = Model.transaction(() => {
        throw new Error("error");
      });
      expectTypeOf(result).toEqualTypeOf<undefined>();
    }
    {
      const result = Model.transaction(() => {
        return "foo";
      });
      expectTypeOf(result).toEqualTypeOf<string | undefined>();
    }
    {
      const result = Model.transaction(() => 12345);
      expectTypeOf(result).toEqualTypeOf<number | undefined>();
    }
  });

  test(".transaction() with Promise", async () => {
    const result = await Model.transaction(async () => {
      return "ok";
    });
    expectTypeOf(result).toEqualTypeOf<string | undefined>();

    const result2 = await Model.transaction(async () => 12345);
    expectTypeOf(result2).toEqualTypeOf<number | undefined>();
  });
});
