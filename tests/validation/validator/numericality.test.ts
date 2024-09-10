import { $ValidateSample } from "../../factories/validateSample";
import { NewValidateSample } from "../../models";

describe("error message", () => {
  let sample: NewValidateSample;
  beforeEach(() => {
    sample = $ValidateSample.build({
      count: 0,
      size: "small",
      pattern: "+123",
      key: "-12.3",
    });
  });
  const subject = () => sample.errors.fullMessages[0];

  test("numericality", () => {
    sample.validates("count", { numericality: {} });
    expect(subject()).toBeUndefined();
    sample.validates("size", { numericality: {} });
    expect(subject()).toBe("Size is not a number");
  });

  test("numericality onlyNumeric", () => {
    sample.validates("count", { numericality: { onlyNumeric: true } });
    expect(subject()).toBeUndefined();
    sample.validates("pattern", { numericality: { onlyNumeric: true } });
    expect(subject()).toBe("Pattern is not a number");
  });

  test("numericality onlyInteger", () => {
    sample.validates("pattern", { numericality: { onlyInteger: true } });
    expect(subject()).toBeUndefined();
    sample.validates("key", { numericality: { onlyInteger: true } });
    expect(subject()).toBe("Key must be an integer");
  });

  test("numericality equalTo", () => {
    sample.validates("pattern", { numericality: { equalTo: 123 } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { equalTo: 1 } });
    expect(subject()).toBe("Count must be equal to 1");
  });

  test("numericality greaterThan", () => {
    sample.validates("pattern", { numericality: { greaterThan: 122 } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { greaterThan: 0 } });
    expect(subject()).toBe("Count must be greater than 0");
  });

  test("numericality greaterThanOrEqualTo", () => {
    sample.validates("pattern", {
      numericality: { greaterThanOrEqualTo: 123 },
    });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { greaterThanOrEqualTo: 1 } });
    expect(subject()).toBe("Count must be greater than or equal to 1");
  });

  test("numericality lessThan", () => {
    sample.validates("pattern", { numericality: { lessThan: 124 } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { lessThan: 0 } });
    expect(subject()).toBe("Count must be less than 0");
  });

  test("numericality lessThanOrEqualTo", () => {
    sample.validates("pattern", { numericality: { lessThanOrEqualTo: 123 } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { lessThanOrEqualTo: -1 } });
    expect(subject()).toBe("Count must be less than or equal to -1");
  });

  test("numericality between", () => {
    sample.validates("pattern", { numericality: { between: [120, 123] } });
    expect(subject()).toBeUndefined();
    sample.validates("key", { numericality: { between: [-15.5, -12.3] } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { between: [0.1, 0.5] } });
    expect(subject()).toBe("Count must be between 0.1 and 0.5");
  });

  test("numericality otherThan", () => {
    sample.validates("pattern", { numericality: { otherThan: 0 } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { otherThan: 0 } });
    expect(subject()).toBe("Count must be other than 0");
  });

  test("numericality odd", () => {
    sample.validates("pattern", { numericality: { odd: true } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { odd: true } });
    expect(subject()).toBe("Count must be odd");
  });

  test("numericality even", () => {
    sample.validates("count", { numericality: { even: true } });
    expect(subject()).toBeUndefined();
    sample.validates("pattern", { numericality: { even: true } });
    expect(subject()).toBe("Pattern must be even");
  });

  test("numericality allowBlank", () => {
    sample.count = undefined;
    sample.validates("count", { numericality: { allowBlank: true } });
    expect(subject()).toBeUndefined();
    sample.validates("count", { numericality: { allowBlank: false } });
    expect(subject()).toBe("Count is not a number");
  });
});
