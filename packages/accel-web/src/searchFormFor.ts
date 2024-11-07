import { Search } from "accel-record/search";
import { formFor } from "./form/index.js";

/**
 * Generates a search form for the given search object.
 *
 * @param s - The search object for which the form is generated.
 * @returns The generated form with the namespace "q".
 * @example
 * ```astro
 * ---
 * import { searchFormFor } from "accel-web";
 * import { Todo } from "src/models";
 *
 * const search = Todo.search({ title_cont: "foo" });
 * const { Form, TextField, Submit } = searchFormFor(search);
 * ---
 * <Form method="get">
 *   <TextField attr="title_cont" />
 *   <Submit>Search</Submit>
 * </Form>
 * ```
 */
export const searchFormFor = (s: Search) => {
  return formFor(s, { namespace: "q" });
};
