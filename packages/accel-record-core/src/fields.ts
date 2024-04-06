import { createId as cuid } from "@paralleldrive/cuid2";
import { BaseDMMF, DMMF } from "prisma/prisma-client/runtime/library.js";
import { Model, Models } from "./index.js";

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

/**
 * Represents a field in a database table.
 */
export class Field {
  /**
   * The name of the field.
   */
  name: string;

  /**
   * The name of the field in the database.
   */
  dbName: string;

  /**
   * The type of the field.
   */
  type: string;

  /**
   * The name of the related field in a relation, or null if not applicable.
   */
  relationName: string | null;

  /**
   * Indicates whether the field is a list.
   */
  isList: boolean;

  /**
   * Indicates whether the field is required.
   */
  isRequired: boolean;

  /**
   * The kind of the field.
   */
  kind: "scalar" | "object" | "enum" | "unsupported";

  /**
   * Indicates whether the field is an updated timestamp.
   */
  isUpdatedAt: boolean;

  /**
   * The default value of the field.
   */
  default: any;

  /**
   * The foreign keys associated with the field.
   */
  foreignKeys: string[];

  /**
   * The primary keys associated with the field.
   */
  primaryKeys: string[];

  /**
   * Constructs a new Field instance.
   * @param field - The DMMF.Field object representing the field.
   */
  constructor(field: DMMF.Field) {
    this.name = field.name;
    this.dbName = field.dbName ?? field.name;
    this.type = field.type;
    this.relationName = field.relationName?.toString() ?? null;
    this.isList = !!field.isList;
    this.isRequired = !!field.isRequired;
    this.kind = field.kind.toString() as
      | "scalar"
      | "object"
      | "enum"
      | "unsupported";
    this.isUpdatedAt = !!field.isUpdatedAt;
    this.default = field.default?.valueOf() ?? undefined;
    this.foreignKeys = field.relationFromFields?.map((f) => f) ?? [];
    this.primaryKeys = field.relationToFields?.map((f) => f) ?? [];
  }

  /**
   * Checks if the default is "now" function.
   * @returns True if the default value is "now", false otherwise.
   */
  get defaultIsNow() {
    return this.default != undefined && this.default.name === "now";
  }

  /**
   * Checks if the default is "uuid" function.
   * @returns True if the default value is "uuid", false otherwise.
   */
  get defaultIsUuid() {
    return this.default != undefined && this.default.name === "uuid";
  }

  /**
   * Checks if the default is "cuid" function.
   * @returns True if the default value is "cuid", false otherwise.
   */
  get defaultIsCuid() {
    return this.default != undefined && this.default.name === "cuid";
  }

  /**
   * Gets the scalar default value.
   * @returns The scalar default value, or undefined if not applicable.
   */
  get scalarDefault() {
    if (this.default != undefined && typeof this.default != "object") {
      return this.cast(this.default);
    }
    return undefined;
  }

  /**
   * Gets the initial value for the field.
   * @returns The initial value for the field.
   */
  getInitialValue() {
    if (this.defaultIsUuid) return crypto.randomUUID();
    if (this.defaultIsCuid) return cuid();
    return this.scalarDefault;
  }

  /**
   * Casts a value to the appropriate type based on the field's type.
   * @param value - The value to cast.
   * @returns The casted value.
   */
  cast(value: any) {
    if (value == undefined) return value;
    switch (this.type) {
      case "BigInt":
      case "Decimal":
      case "Float":
      case "Int":
        return Number(value);
      case "Bytes":
      case "String":
        return String(value);
      case "Boolean":
        return !!value;
      case "DateTime":
        return new Date(value);
      case "JSON":
        return JSON.parse(value);
      default:
        return value;
    }
  }
}

const buildAssociation = (
  model: DMMF.Model,
  field: Field,
  primaryKeys: readonly string[]
) => {
  const rModel = dmmf.datamodel.models.find((m) => m.name === field.type)!;
  const r = rModel?.fields.find((f) => f.relationName === field.relationName);
  if (r?.relationFromFields == undefined || r?.relationToFields == undefined)
    return undefined;

  const foreignKeys1 = r.relationFromFields.map(
    (name) => rModel.fields.find((f) => f.name === name)?.dbName ?? name
  );
  const foreignKeys2 = field.foreignKeys.map(
    (name) => model.fields.find((f) => f.name === name)?.dbName ?? name
  );

  const primaryKeys1 = r.relationToFields.map(
    (name) => model.fields.find((f) => f.name === name)?.dbName ?? name
  );
  const primaryKeys2 = field.primaryKeys.map(
    (name) => rModel.fields.find((f) => f.name === name)?.dbName ?? name
  );

  return new Association(
    r,
    field,
    primaryKeys,
    foreignKeys1.concat(foreignKeys2),
    primaryKeys1.concat(primaryKeys2)
  );
};

let dmmf: BaseDMMF;

export const loadDmmf = async () => {
  const { Prisma } = await import("@prisma/client");
  dmmf = Prisma.dmmf;
};

/**
 * Represents a collection of utility methods for working with fields in a database table.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Fields {
  static table: string | undefined = undefined;

  /**
   * Gets the name of the table associated with the current class.
   * If the table name is not explicitly set, it returns the name of the class.
   */
  static get tableName(): string {
    return this.table ?? this.name;
  }

  private static get model() {
    const tableName = this.tableName;
    const model = dmmf.datamodel.models.find((m) =>
      [m.name, m.dbName].includes(tableName)
    );
    if (!model) throw new Error(`Model for table '${tableName}' not found`);
    return model;
  }

  /**
   * Gets an array of fields associated with the current class.
   * Each field is represented as an instance of the `Field` class.
   */
  static get fields(): Readonly<Field[]> {
    return (this.model?.fields ?? []).map((field) => new Field(field));
  }

  /**
   * Finds a field by its name in the fields associated with the current class.
   * @param name - The name of the field to find.
   * @returns The `Field` instance if found, otherwise `undefined`.
   */
  static findField(name: string): Field | undefined {
    return this.fields.find((f) => f.name === name);
  }

  /**
   * Gets an array of column fields associated with the current class.
   * Column fields are fields that are not part of any relation.
   */
  static get columnFields(): Readonly<Field[]> {
    return this.fields.filter((f) => f.relationName == undefined);
  }

  /**
   * Converts an attribute name to its corresponding column name.
   * @param column - The attribute name to convert.
   * @returns The corresponding column name if found, otherwise `undefined`.
   */
  static attributeToColumn(column: string) {
    for (const field of this.fields) {
      if (field.relationName != undefined) continue;
      if (field.name === column) return field.dbName;
    }
    return undefined;
  }

  /**
   * Converts a column name to its corresponding attribute name.
   * @param column - The column name to convert.
   * @returns The corresponding attribute name if found, otherwise `undefined`.
   */
  static columnToAttribute(column: string) {
    for (const field of this.fields) {
      if (field.relationName != undefined) continue;
      if (field.dbName === column) return field.name;
    }
    return undefined;
  }

  /**
   * Gets an array of primary key fields associated with the current class.
   * If the model has a defined primary key, it returns the primary key fields.
   * Otherwise, it returns an array of fields marked as `isId`.
   */
  static get primaryKeys() {
    return (
      this.model?.primaryKey?.fields ??
      this.model?.fields.filter((f) => f.isId).map((f) => f.dbName ?? f.name) ??
      []
    );
  }

  /**
   * Gets association informations associated with the current class.
   * The record is a key-value pair where the key is the field name and the value is the `Association`.
   */
  static get associations(): Record<string, Association> {
    const myModel = this.model;
    return this.fields
      .filter((f) => f.relationName != undefined)
      .reduce((acc, field) => {
        const a = buildAssociation(myModel, field, this.primaryKeys);
        if (!a) return acc;

        return {
          ...acc,
          ...{ [field.name]: a },
        };
      }, {});
  }

  /**
   * Gets an array of fields associated with the current instance.
   * Each field is represented as an instance of the `Field` class.
   */
  get fields(): Readonly<Field[]> {
    return (this.constructor as typeof Model).fields;
  }

  /**
   * Finds a field by its name in the fields associated with the current instance.
   * @param name - The name of the field to find.
   * @returns The `Field` instance if found, otherwise `undefined`.
   */
  findField(name: string): Field | undefined {
    return this.fields.find((f) => f.name === name);
  }

  /**
   * Gets an array of column fields associated with the current instance.
   * Column fields are fields that are not part of any relation.
   */
  get columnFields(): Readonly<Field[]> {
    return (this.constructor as typeof Model).columnFields;
  }

  /**
   * Gets an array of column names associated with the current instance.
   */
  get columns(): string[] {
    return this.columnFields.map((f) => f.dbName);
  }

  /**
   * Gets an array of primary key values associated with the current instance.
   */
  get primaryKeys(): readonly string[] {
    return (this.constructor as typeof Model).primaryKeys;
  }

  /**
   * Gets an array of primary key values associated with the current instance.
   */
  get pkValues(): any[] {
    return (this.primaryKeys as (keyof this)[]).map((key) => this[key]);
  }
}
