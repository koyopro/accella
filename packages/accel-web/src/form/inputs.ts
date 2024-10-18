import { extendCommponent } from "./index.js";
import input from "./input.astro";

export const makeTextField = (prefix: string, r: any) => {
  return extendCommponent<"input", { attr: string }>(
    input,
    (p) => ({ name: `${prefix}${p.attr}`, value: r[p.attr], type: "text" }),
    ["attr"]
  );
};

export const makeHiddenField = (prefix: string, r: any) => {
  return extendCommponent<"input", { attr: string }>(
    input,
    (p) => ({ name: `${prefix}${p.attr}`, value: r[p.attr], type: "hidden" }),
    ["attr"]
  );
};

export const makePasswordField = (prefix: string) => {
  return extendCommponent<"input", { attr: string }>(
    input,
    (p) => ({ name: `${prefix}${p.attr}`, type: "password" }),
    ["attr"]
  );
};
export const makeNumberField = (prefix: string, r: any) => {
  return extendCommponent<"input", { attr: string }>(
    input,
    (p) => ({
      name: `+${prefix}${p.attr}`,
      value: r[p.attr],
      type: "number",
    }),
    ["attr"]
  );
};

export const makeDateField = (prefix: string, r: any) =>
  extendCommponent<"input", { attr: string }>(
    input,
    (p) => ({
      name: `${prefix}${p.attr}`,
      value: formatDate(r[p.attr]),
      type: "date",
    }),
    ["attr"]
  );

export const makeCheckbox = (prefix: string, r: any) => {
  return extendCommponent<"input", { attr: string }>(
    input,
    (p) => ({
      name: `${prefix}${p.attr}`,
      type: "checkbox",
      checked: !!r[p.attr],
    }),
    ["attr"]
  );
};

export const makeRadioButton = (prefix: string) =>
  extendCommponent<"input", { attr: string }>(
    input,
    (p) => ({
      name: `${prefix}${p.attr}`,
      type: "radio",
    }),
    ["attr"]
  );

const formatDate = (date: any) => {
  if (date instanceof Date) {
    if (isInvalidDate(date)) return "";
    return date.toISOString().slice(0, 10);
  }
  return date;
};
const isInvalidDate = (date: Date) => Number.isNaN(date.getTime());
