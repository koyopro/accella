import { Search } from "accel-record/search";
import { formWith } from "./formWith";

export const searchFormFor = (s: Search) => {
  // TODO: fix type error
  return formWith(s as any, { namespace: "q" });
};
