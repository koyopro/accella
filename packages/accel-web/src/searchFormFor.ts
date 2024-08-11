import type { Model } from "accel-record";
import { createComponent } from "astro/runtime/server/astro-component.js";
import button from "./nativeComponents/button.astro";
import form from "./nativeComponents/form.astro";
import input from "./nativeComponents/input.astro";
import label from "./nativeComponents/label.astro";
import { Search } from "accel-record/search";
import { extendCommponent } from "./formWith";

export const searchFormFor = (s: Search) => {
  const r = s.params;
  return {
    Form: form,

    SearchField: extendCommponent<"input", { name: string }>(
      input,
      (p) => ({ name: `q.${p.name}`, value: r[p.name], type: "text" }),
      ["name"]
    ),

    NumberField: extendCommponent<"input", { attr: string }>(
      input,
      (p) => ({
        name: `+q.${p.attr}`,
        value: r[p.attr],
        type: "number",
      }),
      ["attr"]
    ),
  };
};
