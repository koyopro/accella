import { Relation } from "./relation/index.js";

/**
 * Decorator function that marks a method as an AccelRecord scope.
 *
 * @example
 * export class ArticleModel extends ApplicationRecord {
 *  @ scope
 *  static published() {
 *    return this.where({ published: true });
 *  }
 *}
 */
export function scope(
  method: (...args: any[]) => Relation<any, any>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: any
) {
  (method as any).isAccelRecordScope = true;
  return method;
}
