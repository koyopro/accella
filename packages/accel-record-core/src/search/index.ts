import { AttributeNotFound } from "../errors.js";
import type { Model } from "../index.js";
import type { Relation } from "../relation/index.js";
import { isBlank } from "../validation/validator/presence.js";
import { RelationUpdater } from "./relation.js";

export class Search {
  readonly params: Record<string, any>;
  readonly [key: string]: any;

  constructor(
    protected model: typeof Model,
    params: Record<string, any> | undefined,
    protected relation: Relation<any, any> | undefined = undefined
  ) {
    this.params = JSON.parse(JSON.stringify(params ?? {}));
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
  result() {
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
    return relation;
  }
}
