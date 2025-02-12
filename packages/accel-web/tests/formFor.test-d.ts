import { FormModel } from "accel-record";
import { attributes } from "accel-record/attributes";
import { formFor } from "src/index";

test("formFor() with FormModel", async () => {
  class SampleForm extends FormModel {
    count = attributes.integer(0);
  }
  const form = SampleForm.build({});
  const {
    Label,
    TextField,
    HiddenField,
    PasswordField,
    NumberField,
    DateField,
    Checkbox,
    RadioButton,
    CollectionRadioButtons,
    Select,
    Textarea,
  } = formFor(form);

  Label({ for: "count" });
  // @ts-expect-error
  Label({ for: "invalidAttr" });

  TextField({ attr: "count" });
  // @ts-expect-error
  TextField({ attr: "invalidAttr" });

  HiddenField({ attr: "count" });
  // @ts-expect-error
  HiddenField({ attr: "invalidAttr" });

  PasswordField({ attr: "count" });
  // @ts-expect-error
  PasswordField({ attr: "invalidAttr" });

  NumberField({ attr: "count" });
  // @ts-expect-error
  NumberField({ attr: "invalidAttr" });

  DateField({ attr: "count" });
  // @ts-expect-error
  DateField({ attr: "invalidAttr" });

  Checkbox({ attr: "count" });
  // @ts-expect-error
  Checkbox({ attr: "invalidAttr" });

  RadioButton({ attr: "count" });
  // @ts-expect-error
  RadioButton({ attr: "invalidAttr" });

  CollectionRadioButtons({ attr: "count", collection: [["1", "one"]] });
  // @ts-expect-error
  CollectionRadioButtons({ attr: "invalidAttr", collection: [["1", "one"]] });

  Select({ attr: "count", collection: [["1", "one"]] });
  // @ts-expect-error
  Select({ attr: "invalidAttr", collection: [["1", "one"]] });

  Textarea({ attr: "count" });
  // @ts-expect-error
  Textarea({ attr: "invalidAttr" });
});
