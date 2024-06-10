import { Model } from "accel-record";

describe("Transaction", () => {
  test(".transaction()", () => {
    const result = Model.transaction(() => {
      return "foo";
    });
    expectTypeOf(result).toEqualTypeOf<string | undefined>();

    const result2 = Model.transaction(() => 12345);
    expectTypeOf(result2).toEqualTypeOf<number | undefined>();
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
