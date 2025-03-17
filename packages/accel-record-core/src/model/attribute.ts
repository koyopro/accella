import "reflect-metadata/lite";
/**
 * Setter methods marked with \@attribute will be included in the type definition and can be used as arguments for methods like create or update.
 *
 * @example
 * export class ArticleModel extends ApplicationRecord {
 *  \@attribute
 *  set published(value: boolean) {
 *    this.status = value ? "published" : "draft";
 *  }
 * }
 */
export function attribute(method: any, _context: any) {
  Reflect.defineMetadata("accelRecord:attribute", true, method);
  return method;
}
