import { Association as Info } from "../fields.js";
import { ModelMeta } from "../index.js";
import { Relation } from "./index.js";

export class Association {
  protected addIncludes(
    this: Relation<unknown, ModelMeta>,
    ...input: string[]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["includes"].push(
      ...input.map((key) => {
        return this.model.associations[key];
      })
    );
    return newOptions;
  }

  protected addJoins(this: Relation<unknown, ModelMeta>, ...input: string[]) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key of input) {
      const info = this.model.associations[key];
      const joins = info.isBelongsTo
        ? this.belongsToJoins(info)
        : info.through
          ? this.hasManyThroughJoins(info)
          : this.hasOneOrHasManyJoins(info);
      newOptions["joins"].push(...joins);
    }
    return newOptions;
  }

  protected hasOneOrHasManyJoins(
    this: Relation<unknown, ModelMeta>,
    info: Info
  ) {
    return [
      [
        info.model.tableName,
        `${this.model.tableName}.${info.primaryKey}`,
        "=",
        `${info.model.tableName}.${info.foreignKey}`,
      ],
    ];
  }

  protected belongsToJoins(this: Relation<unknown, ModelMeta>, info: Info) {
    return [
      [
        info.model.tableName,
        `${info.model.tableName}.${info.primaryKey}`,
        "=",
        `${this.model.tableName}.${info.foreignKey}`,
      ],
    ];
  }

  protected hasManyThroughJoins(
    this: Relation<unknown, ModelMeta>,
    info: Info
  ) {
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

  protected addJoinsRaw(
    this: Relation<unknown, ModelMeta>,
    query: string,
    ...bindings: any[]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["joinsRaw"].push([query, bindings]);
    return newOptions;
  }
}
