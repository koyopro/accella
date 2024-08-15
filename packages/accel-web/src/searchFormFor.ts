import { Search } from "accel-record/search";
import { formWith } from "./formWith";

export const searchFormFor = (s: Search) => {
  return formWith(s, { namespace: "q" });
};
