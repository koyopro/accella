import { deepMerge } from "../merge.js";
import { ModelMeta } from "../meta.js";
import { Relation } from "./index.js";

export class Merge {
  merge<T, M extends ModelMeta>(this: Relation<T, M>, relation: Relation<T, M>): Relation<T, M> {
    this.options = deepMerge(this.options, relation.options);
    return this;
  }
}
