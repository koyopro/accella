import { Model } from "accel-record-core";

describe("Transaction", () => {
  test(".transaction()", () => {
    const result = Model.transaction(() => {
      return "foo";
    });
    expectTypeOf(result).toEqualTypeOf<string | undefined>();

    const result2 = Model.transaction(() => 12345);
    expectTypeOf(result2).toEqualTypeOf<number | undefined>();
  });
});
