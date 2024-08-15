import type { APIContext } from "astro";

export const buildPageLink = (context: APIContext, p: number) => {
  const url = new URL(context.url);
  url.searchParams.set("p", String(p));
  return url.toString();
};
