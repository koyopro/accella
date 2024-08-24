import type { Model } from "accel-record";
import { createComponent } from "astro/runtime/server/astro-component.js";
import button from "./nativeComponents/button.astro";
import collectionRadioButtons from "./nativeComponents/collectionRadioButtons.astro";
import form from "./nativeComponents/form.astro";
import input from "./nativeComponents/input.astro";
import label from "./nativeComponents/label.astro";
import select from "./nativeComponents/select.astro";

// eslint-disable-next-line max-lines-per-function
export const formWith = (resource: Model, options?: { namespace?: string }) => {
  const namespace = options?.namespace || "";
  const prefix = namespace ? `${namespace}.` : "";
  const r = resource as any;
  return {
    Form: form,

    Label: extendCommponent<"label", { for: string }>(
      label,
      (p) => ({
        htmlFor: `${prefix}${p.for}`,
        value: resource.class().humanAttributeName(p.for),
      }),
      ["for"]
    ),

    TextField: extendCommponent<"input", { attr: string }>(
      input,
      (p) => ({ name: `${prefix}${p.attr}`, value: r[p.attr], type: "text" }),
      ["attr"]
    ),

    PasswordField: extendCommponent<"input", { attr: string }>(
      input,
      (p) => ({ name: `${prefix}${p.attr}`, type: "password" }),
      ["attr"]
    ),

    NumberField: extendCommponent<"input", { attr: string }>(
      input,
      (p) => ({
        name: `${prefix}${p.attr}`,
        value: r[p.attr],
        type: "number",
      }),
      ["attr"]
    ),

    DateField: extendCommponent<"input", { attr: string }>(
      input,
      (p) => ({
        name: `${prefix}${p.attr}`,
        value: formatDate(r[p.attr]),
        type: "date",
      }),
      ["attr"]
    ),

    Select: extendCommponent<
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
    ),

    RadioButton: extendCommponent<"input", { attr: string }>(
      input,
      (p) => ({
        name: `${prefix}${p.attr}`,
        type: "radio",
      }),
      ["attr"]
    ),

    CollectionRadioButtons: extendCommponent<"input", {}>(
      collectionRadioButtons,
      (p) => ({
        collection: p.collection,
        name: `${prefix}${p.attr}`,
        value: r[p.attr],
      }),
      []
    ) as (props: { attr: string; collection: [string, string][] }) => any,

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

const formatDate = (date: any) => {
  if (date instanceof Date) {
    if (isInvalidDate(date)) return "";
    return date.toISOString().slice(0, 10);
  }
  return date;
};
const isInvalidDate = (date: Date) => Number.isNaN(date.getTime());
