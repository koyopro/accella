import { validates } from "accel-record-core/dist/model/validations";
import { ValidateSampleModel } from "../validateSample";

test("validates()", () => {
  validates(ValidateSampleModel, [["accepted", { acceptance: true }]]);
  validates(ValidateSampleModel, [[["key", "size"], { presence: true }]]);
  validates(ValidateSampleModel, [["accepted", { acceptance: true }]]);
  validates(ValidateSampleModel, [["key", { uniqueness: { scope: ["size", "id"] } }]]);
  // @ts-expect-error
  validates(ValidateSampleModel, [["foo", { acceptance: true }]]);
  // @ts-expect-error
  validates(ValidateSampleModel, [[["key", "foo"], { presence: true }]]);
  // @ts-expect-error
  validates(ValidateSampleModel, [["accepted", { foo: true }]]);
  // @ts-expect-error
  validates(ValidateSampleModel, [["key", { uniqueness: { scope: ["size", "foo"] } }]]);
});
