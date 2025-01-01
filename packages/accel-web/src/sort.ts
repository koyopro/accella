import { Search } from "accel-record/search";

type Direction = "asc" | "desc";

export const sortUrl = (
  q: Search<any>,
  key: string,
  options?: { defaultOrder?: Direction; keys?: string[]; request?: Request }
) => {
  const keys = options?.keys ?? [key];
  const defaultOrder = options?.defaultOrder ?? "asc";
  const sorts = buildCurrentSorts(q);
  for (const k of keys) {
    const [attr, dir] = k.split(" ") as [string, Direction | undefined];
    sorts.set(attr, dir ?? flip(sorts.get(attr)) ?? defaultOrder);
  }
  const value = Array.from(sorts.entries())
    .map(([k, d]) => `${k} ${d}`)
    .join(",");
  const url = options?.request?.url;
  if (url) return updateQueryParameter(url, "q.s", value);
  return `?${new URLSearchParams({ "q.s": value }).toString()}`;
};

const buildCurrentSorts = (q: Search<any>) => {
  const sorts = new Map<string, Direction>();
  for (const sort of q.sorts) {
    const [attr, direction] = sort.split(" ");
    sorts.set(attr, direction as Direction);
  }
  return sorts;
};

const updateQueryParameter = (url: string, paramName: string, paramValue: string) => {
  const urlObj = new URL(url);
  urlObj.searchParams.set(paramName, paramValue);
  return urlObj.toString();
};

const flip = (direction: Direction | undefined) => {
  if (!direction) return undefined;
  return direction === "asc" ? "desc" : "asc";
};
