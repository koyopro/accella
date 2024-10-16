import { Model } from "accel-record";
import "astro/astro-jsx";
import { createComponent } from "astro/runtime/server/astro-component.js";
import {
  makeCheckbox,
  makeDateField,
  makeHiddenField,
  makeNumberField,
  makePasswordField,
  makeRadioButton,
  makeTextField,
} from "./inputs.js";

import button from "./button.astro";
import collectionRadioButtons from "./collectionRadioButtons.astro";
import form from "./form.astro";
import label from "./label.astro";
import select from "./select.astro";
import textarea from "./textarea.astro";

export const formFor = (resource: any, options?: { namespace?: string }) => {
  const namespace = options?.namespace || "";
  const prefix = namespace
    ? `${namespace}.`
    : resource instanceof Model
      ? `${toCamelCase(resource.class().name)}.`
      : "";
  return {
    Form: form,

    Label: makeLabel(prefix, resource),

    TextField: makeTextField(prefix, resource),

    HiddenField: makeHiddenField(prefix, resource),

    PasswordField: makePasswordField(prefix),

    NumberField: makeNumberField(prefix, resource),

    DateField: makeDateField(prefix, resource),

    Checkbox: makeCheckbox(prefix, resource),

    RadioButton: makeRadioButton(prefix),

    CollectionRadioButtons: makeCollectionRadioButtons(prefix, resource),

    Select: makeSelect(prefix, resource),

    Textarea: makeTextarea(prefix, resource),

    Submit: extendCommponent<"button", {}>(button, () => ({ type: "submit" })),
  };
};

export const extendCommponent = <L extends keyof astroHTML.JSX.DefinedIntrinsicElements, P>(
  base: any,
  defaluts: (p: any) => any,
  removes: string[] = []
): ((props: astroHTML.JSX.DefinedIntrinsicElements[L] & P) => any) => {
  return createComponent((...args) => {
    const defaultValues = defaluts(args[1]);
    for (const remove of removes) {
      delete args[1][remove];
    }
    return base(args[0], { ...defaultValues, ...args[1] }, args[2]);
  }) as any;
};

const makeSelect = (prefix: string, r: any) =>
  extendCommponent<
    "select",
    {
      attr: string;
      collection: [string, string | undefined][];
      selected?: string;
      includeBlank?: string;
    }
  >(
    select,
    (p) => ({
      name: `${prefix}${p.attr}`,
      collection: p.collection,
      selected: p.selected ?? r[p.attr],
      includeBlank: p.includeBlank,
    }),
    ["attr", "collection", "selected", "includeBlank"]
  );

const makeCollectionRadioButtons = (
  prefix: string,
  r: any
): ((props: { attr: string; collection: [string, string][] }) => any) => {
  return extendCommponent<"input", {}>(
    collectionRadioButtons,
    (p) => ({
      collection: p.collection,
      name: `${prefix}${p.attr}`,
      value: r[p.attr],
    }),
    []
  );
};

const makeLabel = (prefix: string, resource: any) => {
  return extendCommponent<"label", { for: string }>(
    label,
    (p) => ({
      htmlFor: `${prefix}${p.for}`,
      value: resource instanceof Model ? resource.class().humanAttributeName(p.for) : undefined,
    }),
    ["for"]
  );
};

const makeTextarea = (prefix: string, r: any) => {
  return extendCommponent<"textarea", { attr: string }>(
    textarea,
    (p) => ({ name: `${prefix}${p.attr}`, value: r[p.attr] }),
    ["attr"]
  );
};

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
