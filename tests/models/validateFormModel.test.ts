import { FormModel } from "accel-record";
import { attributes } from "accel-record/attributes";
import { validates } from "accel-record/validations";

class SampleForm extends FormModel {
  static validations = validates(this, [
    [
      "count",
      {
        numericality: { between: [0, 10] },
      },
    ],
  ]);

  count = attributes.integer(0);
}

test(".validations", () => {
  const form = SampleForm.build({ count: 5 });
  expect(form.isValid()).toBe(true);
  form.count = 11;
  expect(form.isValid()).toBe(false);
  expect(form.errors.fullMessages).toEqual(["Count must be between 0 and 10"]);
});
