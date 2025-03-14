/**
 * Decorator function to mark a method as assignable in AccelRecord.
 * Methods marked with \@assignable will be reflected in the type and can be used as arguments for methods like create or update.
 *
 * @example
 * export class ArticleModel extends ApplicationRecord {
 *  \@assignable
 *  set publish(value: boolean) {
 *    this.status = value ? "published" : "draft";
 *  }
 * }
 */
export function assignable(method: any, _context: any) {
  (method as any).isAccelRecordAssinable = true;
  return method;
}
