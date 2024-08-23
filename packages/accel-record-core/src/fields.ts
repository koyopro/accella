import { BaseDMMF } from "prisma/prisma-client/runtime/library.js";
import { Model } from "./index.js";
import { Association, buildAssociation } from "./model/association.js";
import { Field } from "./model/field.js";

export let dmmf: BaseDMMF;

export const loadDmmf = async () => {
  const { Prisma } = await import("@prisma/client");
  // @ts-ignore
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
    const model = dmmf.datamodel.models.find((m) => [m.name, m.dbName].includes(tableName));
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
