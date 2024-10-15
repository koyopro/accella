import type { Relation } from "accel-record";
import { createComponent } from "astro/runtime/server/astro-component.js";
import LinkToNextPage from "./linkToNextPage.astro";
import LinkToPrevPage from "./linkToPrevPage.astro";
import Nav from "./nav.astro";
import PageEntriesInfo from "./pageEntriesInfo.astro";

export type Options = {
  /**
   * The current page number.
   */
  page: number;
  /**
   * The number of records per page.
   * @default 25
   */
  per?: number;
  /**
   * The number of pages to display in the pagination window.
   * @default 4
   */
  window?: number;
  /**
   * Whether to count the total number of records.
   * @default true
   */
  count?: boolean;
};

/**
 * Paginates a query result set based on the provided options.
 *
 * @example
 * ```ts
 * import { User } from "./models/index.js";
 * import { paginate } from "accel-web";
 *
 * const { Nav, PageEntriesInfo } = paginate(User.order('id', 'desc'), { page: 1, per: 10 });
 * ```
 */
export const paginate = <T>(query: Relation<T, any>, options: Options) => {
  const page = options.page;
  const per = options.per ?? 25;
  const count = options.count ?? true;
  const window = options.window ?? 4;
  const offset = (page - 1) * per;
  const total = count ? query.count() : 0;
  const totalPages = Math.ceil(total / per);
  return {
    /**
     * The current page number.
     */
    page,
    /**
     * The number of records per page.
     */
    per,
    /**
     * The total number of records.
     */
    total,
    /**
     * The total number of pages.
     */
    totalPages,
    /**
     * The records for the current page.
     */
    records: query.offset(offset).limit(per),
    /**
     * Information component about the page entries.
     */
    PageEntriesInfo: ex(PageEntriesInfo, { offset, per, total }),
    /**
     * Navigation component for the pagination.
     */
    Nav: ex(Nav, { page, totalPages, window }),
    /**
     * Link component to the previous page.
     */
    LinkToPrevPage: ex(LinkToPrevPage, { page }),
    /**
     * Link component to the next page.
     */
    LinkToNextPage: ex(LinkToNextPage, { page }),
  };
};

export const ex = (base: any, defaults: any, removes: string[] = []): (() => any) => {
  return createComponent((...args) => {
    for (const remove of removes) {
      delete args[1][remove];
    }
    return base(args[0], { ...defaults, ...args[1] }, args[2]);
  }) as any;
};
