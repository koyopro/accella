import type { Model } from "accel-record";
import { createComponent } from "astro/runtime/server/astro-component.js";
import button from "./nativeComponents/button.astro";
import form from "./nativeComponents/form.astro";
import input from "./nativeComponents/input.astro";
import label from "./nativeComponents/label.astro";

export const formWith = (resource: Model) => {
  const r = resource as any;
  return {
    Form: form,

    Label: createComponent((a: any, b: any, c: any) => {
      const { for: for_, ...props } = b;
      const p = {
        htmlFor: for_,
        value: resource.class().humanAttributeName(for_),
        ...props,
      };
      return (label as any)(a, p, c);
    }) as (props: astroHTML.JSX.LabelHTMLAttributes & { for: string }) => any,

    TextField: createComponent((a: any, b: any, c: any) => {
      const { attr, ...props } = b;
      const p = { name: attr, value: r[attr], ...props, type: "text" };
      return (input as any)(a, p, c);
    }) as (
      props: Omit<astroHTML.JSX.InputHTMLAttributes, "type"> & { attr: string }
    ) => any,

    PasswordField: createComponent((a: any, b: any, c: any) => {
      const { attr, ...props } = b;
      const p = { name: attr, ...props, type: "password" };
      return (input as any)(a, p, c);
    }) as (
      props: Omit<astroHTML.JSX.InputHTMLAttributes, "type"> & { attr: string }
    ) => any,

    NumberField: createComponent((a: any, b: any, c: any) => {
      const { attr, ...props } = b;
      const p = {
        name: `+${attr}`,
        value: r[attr],
        ...props,
        type: "number",
      };
      return (input as any)(a, p, c);
    }) as (
      props: Omit<astroHTML.JSX.InputHTMLAttributes, "type"> & { attr: string }
    ) => any,

    Submit: createComponent((a: any, b: any, c: any) => {
      const { ...props } = b;
      const p = { ...props, type: "submit" };
      return (button as any)(a, p, c);
    }) as (props: Omit<astroHTML.JSX.ButtonHTMLAttributes, "type">) => any,
  };
};
