import { Search } from "accel-record/search";
import { formFor } from "./form/index.js";

export const searchFormFor = (s: Search) => {
  return formFor(s, { namespace: "q" });
};
