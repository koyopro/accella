import { Search } from "accel-record/search";

export type Direction = "asc" | "desc";

/**
 * Generates a URL for sorting based on the provided search query and sorting options.
 *
 * @param q - The search query object.
 * @param key - The attribute(s) to sort by.
 * @param options - Optional sorting options.
 * @param options.defaultOrder - The default sorting order if not specified (default is "asc").
 * @param options.request - An optional request object containing the URL to update.
 * @returns URL with the sorting parameters.
 */
export const sortUrl = (
  q: Search<any>,
  key: string | string[],
  options?: { defaultOrder?: Direction; request?: Request }
) => {
  const keys = [key].flat();
  const defaultOrder = options?.defaultOrder ?? "asc";
  const oldsorts = buildCurrentSorts(q);
  const sorts = new Map<string, Direction>();
  for (const k of keys) {
    const [attr, dir] = k.split(" ") as [string, Direction | undefined];
    sorts.set(attr, dir ?? flip(oldsorts.get(attr)) ?? defaultOrder);
  }

  const url = options?.request?.url;
  if (url) return updateQueryParameter(url, "q.s[]", sorts);

  const value = Array.from(sorts.entries())
    .map(([k, d]) => `q.s[]=${k}+${d}`)
    .join("&");
  return `?${value}`;
};

const buildCurrentSorts = (q: Search<any>) => {
  const sorts = new Map<string, Direction>();
  for (const sort of q.sorts) {
    const [attr, direction] = sort.split(" ");
    sorts.set(attr, direction as Direction);
  }
  return sorts;
};

const updateQueryParameter = (url: string, paramName: string, sorts: Map<string, Direction>) => {
  const urlObj = new URL(url);
  urlObj.searchParams.delete(paramName);
  for (const [k, v] of sorts.entries()) {
    urlObj.searchParams.append(paramName, `${k} ${v}`);
  }
  return urlObj.toString();
};

const flip = (direction: Direction | undefined) => {
  if (!direction) return undefined;
  return direction === "asc" ? "desc" : "asc";
};
