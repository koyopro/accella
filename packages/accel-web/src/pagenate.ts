import type { Relation } from "accel-record";
import { createComponent } from "astro/runtime/server/astro-component.js";
import LinkToNextPage from "./paginate/linkToNextPage.astro";
import LinkToPrevPage from "./paginate/linkToPrevPage.astro";
import Nav from "./paginate/nav.astro";
import PageEntriesInfo from "./paginate/pageEntriesInfo.astro";

export const paginate = <T>(
  query: Relation<T, any>,
  options: { page: number; per?: number; window?: number; count?: boolean }
) => {
  const page = options.page;
  const per = options.per ?? 25;
  const count = options.count ?? true;
  const window = options.window ?? 4;
  const offset = (page - 1) * per;
  const limit = per;
  const total = count ? query.count() : 0;
  const totalPages = Math.ceil(total / per);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (i) => Math.abs(i - page) <= window
  );
  return {
    page,
    per,
    total,
    totalPages,
    records: query.offset(offset).limit(limit),
    PageEntriesInfo: ex(PageEntriesInfo, { offset, per, total }),
    Nav: ex(Nav, { page, pages, totalPages }),
    LinkToPrevPage: ex(LinkToPrevPage, { page }),
    LinkToNextPage: ex(LinkToNextPage, { page }),
  };
};

const ex = (base: any, defaults: any, removes: string[] = []): (() => any) => {
  return createComponent((...args) => {
    for (const remove of removes) {
      delete args[1][remove];
    }
    return base(args[0], { ...defaults, ...args[1] }, args[2]);
  }) as any;
};
