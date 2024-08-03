import { Association as Info } from "../fields.js";
import { ModelMeta } from "../meta.js";
import { Relation, Relations } from "./index.js";

/**
 * Provides the association methods for relations.
 *
 * This class is intended to be inherited by the Relation class.
 */
export class Association {
  /**
   * Adds associations to be included in the query result.
   *
   * @param input - The association keys to include.
   * @returns A new `Relation` instance with the specified associations included.
   */
  includes<T, M extends ModelMeta>(
    this: Relations<T, M>,
    ...input: M["AssociationKey"][]
  ): Relation<T, M>;
  includes<T, M extends ModelMeta>(
    this: Relation<T, M>,
    ...input: M["AssociationKey"][]
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["includes"].push(
      ...input.map((key) => {
        return this.model.associations[key];
      })
    );
    return new Relation(this.model, newOptions);
  }

  joins<T, M extends ModelMeta>(
    this: Relations<T, M>,
    input: M["JoinInput"]
  ): Relation<T, M>;
  /**
   * Adds join conditions to the relation.
   *
   * @param input - The association keys to join.
   * @returns A new `Relation` instance with the added join conditions.
   */
  joins<T, M extends ModelMeta>(
    this: Relations<T, M>,
    ...input: M["AssociationKey"][]
  ): Relation<T, M>;
  joins<T, M extends ModelMeta>(this: Relation<T, M>, ...input: any[]) {
    const hash = formatJoinsInput(...input);
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const [key, value] of Object.entries(hash)) {
      const info = this.model.associations[key];
      const joins = info.isBelongsTo
        ? this.belongsToJoins(info)
        : info.through
          ? this.hasManyThroughJoins(info)
          : this.hasOneOrHasManyJoins(info);
      const nestedJoins = isBlankArray(value)
        ? []
        : info.model.joins(value).options.joins;
      for (const join of joins.concat(nestedJoins)) {
        if (alreadyContains(newOptions["joins"], join)) continue;

        newOptions["joins"].push(join);
      }
    }
    return new Relation(this.model, newOptions);
  }

  protected hasOneOrHasManyJoins<T>(this: Relation<T, ModelMeta>, info: Info) {
    return [
      [
        info.model.tableName,
        `${this.model.tableName}.${info.primaryKey}`,
        "=",
        `${info.model.tableName}.${info.foreignKey}`,
      ],
    ];
  }

  protected belongsToJoins<T>(this: Relation<T, ModelMeta>, info: Info) {
    return [
      [
        info.model.tableName,
        `${info.model.tableName}.${info.primaryKey}`,
        "=",
        `${this.model.tableName}.${info.foreignKey}`,
      ],
    ];
  }

  protected hasManyThroughJoins<T>(this: Relation<T, ModelMeta>, info: Info) {
    const { through, model, primaryKey, foreignKey, joinKey } = info;
    return [
      [
        through,
        `${through}.${foreignKey}`,
        "=",
        `${this.model.tableName}.${primaryKey}`,
      ],
      [
        model.tableName,
        `${through}.${joinKey}`,
        "=",
        `${model.tableName}.${info.primaryKey}`,
      ],
    ];
  }

  /**
   * Adds a raw join clause to the query.
   *
   * @param query - The raw SQL query string.
   * @param bindings - The bindings to be used in the query.
   * @returns A new `Relation` instance with the added join clause.
   */
  joinsRaw<T, M extends ModelMeta>(
    this: Relation<T, M>,
    query: string,
    ...bindings: any[]
  ): Relation<T, M> {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["joinsRaw"].push([query, bindings]);
    return new Relation(this.model, newOptions);
  }
}

function alreadyContains(arrays: any[][], targetArray: any[]): boolean {
  return arrays.some(
    (array) =>
      array.length === targetArray.length &&
      array.every((value, index) => value === targetArray[index])
  );
}

function formatJoinsInput(...input: any[]): object {
  // e.g. User.joins(["posts", "tags"])
  if (input.length === 1 && Array.isArray(input[0])) {
    return input[0].toHash((t) => [t, []]);
  }
  // e.g. User.joins({ posts: "tags" })
  if (input.length === 1 && typeof input[0] === "object") {
    return input[0];
  }
  // e.g. User.joins("posts", "tags")
  return input.toHash((t) => [t, []]);
}

function isBlankArray(value: any): boolean {
  return Array.isArray(value) && value.length === 0;
}
