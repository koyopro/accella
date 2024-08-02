import { Model, Relation } from "../index.js";

export class Searchable {
  static search<T extends typeof Model>(
    this: T,
    params: Record<string, number | string>
  ) {
    return new Search(this, params);
  }
}

export class Search {
  constructor(
    protected model: typeof Model,
    protected params: Record<string, number | string>
  ) {}

  result() {
    let relation = this.model.all();
    for (const [key, value] of Object.entries(this.params)) {
      relation = this.updateRelation(relation, key, value);
    }
    return relation;
  }

  private updateRelation(
    relation: Relation<any, any>,
    key: string,
    value: any
  ) {
    const [name, predicate] = splitFromLast(key, "_");
    const ors = name.split("_or_");
    if (ors.length > 1) {
      let r = this.buildRelation(this.model.all(), ors[0], predicate, value);
      for (const attr of ors.slice(1)) {
        r = r.or(this.buildRelation(this.model.all(), attr, predicate, value));
      }
      return relation.merge(r);
    }
    const attrs = name.split("_and_");
    for (const attr of attrs) {
      relation = this.buildRelation(relation, attr, predicate, value);
    }
    return relation;
  }

  private buildRelation(
    relation: Relation<any, any>,
    attrStr: string,
    predicate: any,
    value: any
  ) {
    const [key, attr] = this.parseAttr(attrStr);
    let ret = relation;
    if (key) ret = ret.joins(key);
    switch (predicate) {
      case "blank":
        if (key) {
          return ret
            .where({ [key]: { [attr]: "" } })
            .or({ [key]: { [attr]: null } });
        }
        return relation.where({ [attr]: null }).or({ [attr]: "" });
      case "present":
        if (key) {
          return ret
            .whereNot({ [key]: { [attr]: "" } })
            .whereNot({ [key]: { [attr]: null } });
        }
        return relation.whereNot({ [attr]: null }).whereNot({ [attr]: "" });
      default:
        const condition = getCondition(predicate, value);
        if (condition === undefined) return relation;
        if (key) {
          return ret.where({ [key]: { [attr]: condition } });
        }
        return ret.where({ [attr]: condition });
    }
  }

  /**
   * Parses the attribute string into the key and attribute.
   * @param attrStr - The attribute string to parse.
   * @returns An arry of the association key and attribute.
   *
   * @example
   * parseAttr("name") // => [undefined, "name"]
   * parseAttr("profile_bio") // => ["profile", "bio"]
   */
  private parseAttr(attrStr: string): [string | undefined, string] {
    const field = this.model.findField(attrStr);
    if (!field) {
      for (const key of Object.keys(this.model.associations)) {
        if (attrStr.startsWith(`${key}_`)) {
          const nestedAttr = attrStr.substring(key.length + 1);
          return [key, nestedAttr];
        }
      }
    }
    return [undefined, attrStr];
  }
}

function splitFromLast(str: string, delimiter: string): [string, string] {
  const lastIndex = str.lastIndexOf(delimiter);
  if (lastIndex === -1) return [str, ""];
  const name = str.substring(0, lastIndex);
  const predicate = str.substring(lastIndex + 1);
  return [name, predicate];
}

const getCondition = (predicate: string, value: any) => {
  switch (predicate) {
    case "eq":
      return value;
    case "cont":
      return { contains: value };
    case "start":
      return { startsWith: value };
    case "end":
      return { endsWith: value };
    case "matches":
      return { like: value };
    case "lt":
      return { "<": value };
    case "lte":
      return { "<=": value };
    case "gt":
      return { ">": value };
    case "gte":
      return { ">=": value };
    case "in":
      return { in: value };
    case "true":
      return true;
    case "false":
      return false;
    case "null":
      return null;
    default:
      // unknown predicate
      return undefined;
  }
};
