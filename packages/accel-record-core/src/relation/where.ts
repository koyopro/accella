import { Relation } from "../index.js";
import { ModelMeta } from "../meta.js";

/**
 * Provides the *where* related methods for relations.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class Where {
  protected addWhere(
    this: Relation<unknown, ModelMeta>,
    input: ModelMeta["WhereInput"]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      const column = this.model.attributeToColumn(key);
      if (!column) throw new Error(`Attribute not found: ${key}`);
      if (Array.isArray(input[key])) {
        newOptions["wheres"].push([column, "in", input[key]]);
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          newOptions["wheres"].push(
            makeWhere(column, operator, input[key][operator])
          );
        }
      } else {
        newOptions["wheres"].push({ [column]: input[key] });
      }
    }
    return newOptions;
  }

  protected addWhereNot(
    this: Relation<unknown, ModelMeta>,
    input: ModelMeta["WhereInput"]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      const column = this.model.attributeToColumn(key);
      if (!column) throw new Error(`Attribute not found: ${key}`);
      if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          if (operator === "in") {
            newOptions["wheres"].push([column, "not in", input[key][operator]]);
          } else {
            newOptions["whereNots"].push(
              makeWhere(column, operator, input[key][operator])
            );
          }
        }
      } else {
        newOptions["whereNots"].push({ [column]: input[key] });
      }
    }
    return newOptions;
  }

  protected addWhereRaw(
    this: Relation<unknown, ModelMeta>,
    query: string,
    ...bindings: any[]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["whereRaws"].push([query, bindings]);
    return newOptions;
  }
}

const makeWhere = (key: string, operator: string, value: string) => {
  switch (operator) {
    case "startsWith":
      return [key, "like", `${value}%`];
    case "endsWith":
      return [key, "like", `%${value}`];
    case "contains":
      return [key, "like", `%${value}%`];
    default:
      return [key, operator, value];
  }
};
