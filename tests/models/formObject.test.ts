import { ModelBase } from "accel-record";
import { attributes } from "accel-record/attributes";

class SampleForm extends ModelBase {
  count = attributes.integer(0.5);
  ratio = attributes.float(0.5);
  date = attributes.date(new Date(0));
  enabled = attributes.boolean(false);
  text = attributes.string("abc");
}

test("default values", () => {
  const form = SampleForm.build({});
  expect(form.count).toBe(0);
  expect(form.ratio).toBeCloseTo(0.5);
  expect(form.date).toEqual(new Date(0));
  expect(form.enabled).toBe(false);
  expect(form.text).toBe("abc");
});

test("integerAttribute", () => {
  const form = SampleForm.build({ count: 1 });
  expect(form.count).toBe(1);
  form.count = "2" as any;
  expect(form.count).toBe(2);
  form.count = "" as any;
  expect(form.count).toBeUndefined();
});

test("floatAttribute", () => {
  const form = SampleForm.build({ ratio: 0.9 });
  expect(form.ratio).toBeCloseTo(0.9);
  form.ratio = "-0.12" as any;
  expect(form.ratio).toBeCloseTo(-0.12);
  form.ratio = "" as any;
  expect(form.ratio).toBeUndefined();
});

test("dateAttribute", () => {
  const now = new Date(0);
  const form = SampleForm.build({ date: now });
  expect(form.date).toEqual(now);
  form.date = "1970-01-01" as any;
  expect(form.date).toEqual(now);
  form.date = "" as any;
  expect(form.date).toBeUndefined();
});

test("booleanAttribute", () => {
  const form = SampleForm.build({ enabled: false });
  expect(form.enabled).toBe(false);
  form.enabled = "true" as any;
  expect(form.enabled).toBe(true);
  form.enabled = "" as any;
  expect(form.enabled).toBeUndefined();
});

test("stringAttribute", () => {
  const form = SampleForm.build({ text: "text" });
  expect(form.text).toBe("text");
  form.text = 1 as any;
  expect(form.text).toBe("1");
  form.text = "" as any;
  expect(form.text).toBe("");
  form.text = undefined;
  expect(form.text).toBeUndefined();
});
