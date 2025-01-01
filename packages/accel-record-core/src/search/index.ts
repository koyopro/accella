import { AttributeNotFound } from "../errors.js";
import type { Meta, Model } from "../index.js";
import type { Relation } from "../relation/index.js";
import { isBlank } from "../validation/validator/presence.js";
import { RelationUpdater } from "./relation.js";

export class Search<T> {
  readonly params: Record<string, any>;
  readonly [key: string]: any;
  sorts: string[];

  constructor(
    protected model: typeof Model,
    params: Record<string, any> | undefined,
    protected relation: Relation<any, any> | undefined = undefined
  ) {
    this.params = JSON.parse(JSON.stringify(params ?? {}));
    const sorts = this.params["s"] ?? [];
    this.sorts = Array.isArray(sorts) ? sorts : [sorts];
    for (const key of Object.keys(this.params)) {
      if (isBlank(this.params[key])) delete this.params[key];
      else if (key.match(/.+_.+/)) {
        Object.defineProperty(this, key, {
          value: this.params[key],
          writable: true,
          configurable: true,
        });
      }
    }
  }

  /**
   * Retrieves the search result based on the specified parameters.
   */
  result(): Relation<T, Meta<T>> {
    let relation = this.relation ?? this.model.all();
    for (const [key, value] of Object.entries(this.params)) {
      try {
        relation = new RelationUpdater(this.model, relation, key, value).update();
      } catch (e) {
        if (e instanceof AttributeNotFound) {
          // Ignore the error
        } else throw e;
      }
    }
    for (const sort of this.sorts) {
      const [attr, direction] = sort.split(" ");
      if (direction !== "asc" && direction !== "desc") continue;
      if (!this.model.attributeToColumn(attr)) continue;
      relation = relation.order(attr, direction);
    }
    return relation as Relation<T, Meta<T>>;
  }
}
