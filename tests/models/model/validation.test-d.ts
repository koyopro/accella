import { validates } from "accel-record-core/dist/model/validations";
import { ValidateSampleModel } from "../validateSample";

test("validates()", () => {
  validates(ValidateSampleModel, [
    ["accepted", { acceptance: true }],
    [["key", "size"], { presence: true }],
    ["accepted", { acceptance: true }],
    ["key", { uniqueness: { scope: ["size", "id"] } }],

    // @ts-expect-error
    ["foo", { acceptance: true }],
    // @ts-expect-error
    [["key", "foo"], { presence: true }],
    // @ts-expect-error
    ["accepted", { foo: true }],
    // @ts-expect-error
    ["key", { uniqueness: { scope: ["size", "foo"] } }],
  ]);
});
