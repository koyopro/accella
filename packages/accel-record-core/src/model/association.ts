import { DMMF } from "prisma/prisma-client/runtime/library.js";
import { dmmf } from "../fields.js";
import { Field } from "./field.js";
import { Models } from "../index.js";

/**
 * Represents an association between two models.
 */
export class Association {
  klass: string;
  foreignKey: string;
  primaryKey: string;
  field: Field;
  isBelongsTo: boolean;
  through: string | undefined;

  /**
   * Creates a new Association instance.
   * @param relation - The DMMF.Field object representing the relation.
   * @param association - The Field object representing the association.
   * @param primaryKeys - An array of primary key column names.
   * @param foreignKeyColumns - An array of foreign key column names.
   * @param primaryKeyColumns - An array of primary key column names.
   */
  constructor(
    relation: DMMF.Field,
    association: Field,
    primaryKeys: readonly string[],
    foreignKeyColumns: string[],
    primaryKeyColumns: string[]
  ) {
    this.klass = association.type;
    this.foreignKey = foreignKeyColumns[0] ?? "";
    this.primaryKey = primaryKeyColumns[0] ?? "";
    this.field = association;
    if (this.foreignKey == "" && this.primaryKey == "") {
      // Implicit many-to-many relations
      this.isBelongsTo = false;
      this.foreignKey = relation.type < association.type ? "A" : "B";
      this.primaryKey = primaryKeys[0];
      this.through = `_${association.relationName}`;
    } else {
      this.isBelongsTo = (relation.relationToFields?.length ?? 0) == 0;
    }
  }

  /**
   * Gets the model associated with this association.
   */
  get model() {
    return Models[this.klass];
  }

  /**
   * Checks if the association represents a has-one relation.
   */
  get isHasOne() {
    return !this.field.isList && !this.isBelongsTo;
  }

  /**
   * Gets the join key for the Implicit Many-to-Many association.
   */
  get joinKey() {
    return this.foreignKey == "A" ? "B" : "A";
  }
}

export const buildAssociation = (
  model: DMMF.Model,
  field: Field,
  primaryKeys: readonly string[]
) => {
  const rModel = dmmf.datamodel.models.find((m) => m.name === field.type)!;
  const r = rModel?.fields.find((f) => f.relationName === field.relationName);
  if (r?.relationFromFields == undefined || r?.relationToFields == undefined) return undefined;

  const findKeys = (m: DMMF.Model) => (name: string) =>
    m.fields.find((f) => f.name === name)?.dbName ?? name;

  const foreignKeys1 = r.relationFromFields.map(findKeys(rModel));
  const foreignKeys2 = field.foreignKeys.map(findKeys(model));
  const primaryKeys1 = r.relationToFields.map(findKeys(model));
  const primaryKeys2 = field.primaryKeys.map(findKeys(rModel));

  return new Association(
    r,
    field,
    primaryKeys,
    foreignKeys1.concat(foreignKeys2),
    primaryKeys1.concat(primaryKeys2)
  );
};
