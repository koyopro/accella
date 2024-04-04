import { createId as cuid } from "@paralleldrive/cuid2";
import { BaseDMMF, DMMF } from "prisma/prisma-client/runtime/library.js";
import { Model, Models } from "./index.js";

export class Association {
  klass: string;
  foreignKey: string;
  primaryKey: string;
  field: Field;
  isBelongsTo: boolean;
  through: string | undefined;

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

  get model() {
    return Models[this.klass];
  }

  get isHasOne() {
    return !this.field.isList && !this.isBelongsTo;
  }

  get joinKey() {
    return this.foreignKey == "A" ? "B" : "A";
  }
}

export class Field {
  name: string;
  dbName: string;
  type: string;
  relationName: string | null;
  isList: boolean;
  isRequired: boolean;
  kind: "scalar" | "object" | "enum" | "unsupported";
  isUpdatedAt: boolean;
  default: any;
  foreignKeys: string[];
  primaryKeys: string[];

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

  get defaultIsNow() {
    return this.default != undefined && this.default.name === "now";
  }

  get defaultIsUuid() {
    return this.default != undefined && this.default.name === "uuid";
  }

  get defaultIsCuid() {
    return this.default != undefined && this.default.name === "cuid";
  }

  get scalarDefault() {
    if (this.default != undefined && typeof this.default != "object") {
      return this.cast(this.default);
    }
    return undefined;
  }

  getInitialValue() {
    if (this.defaultIsUuid) return crypto.randomUUID();
    if (this.defaultIsCuid) return cuid();
    return this.scalarDefault;
  }

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

export class Fields {
  static table: string | undefined = undefined;

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

  static get fields(): Readonly<Field[]> {
    return (this.model?.fields ?? []).map((field) => new Field(field));
  }

  static findField(name: string): Field | undefined {
    return this.fields.find((f) => f.name === name);
  }

  static get columnFields(): Readonly<Field[]> {
    return this.fields.filter((f) => f.relationName == undefined);
  }

  static attributeToColumn(column: string) {
    for (const field of this.fields) {
      if (field.relationName != undefined) continue;
      if (field.name === column) return field.dbName;
    }
    return undefined;
  }

  static columnToAttribute(column: string) {
    for (const field of this.fields) {
      if (field.relationName != undefined) continue;
      if (field.dbName === column) return field.name;
    }
    return undefined;
  }

  static get primaryKeys() {
    return (
      this.model?.primaryKey?.fields ??
      this.model?.fields.filter((f) => f.isId).map((f) => f.dbName ?? f.name) ??
      []
    );
  }

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

  get fields(): Readonly<Field[]> {
    return (this.constructor as typeof Model).fields;
  }

  findField(name: string): Field | undefined {
    return this.fields.find((f) => f.name === name);
  }

  get columnFields(): Readonly<Field[]> {
    return (this.constructor as typeof Model).columnFields;
  }

  get columns(): string[] {
    return this.columnFields.map((f) => f.dbName);
  }

  get primaryKeys(): readonly string[] {
    return (this.constructor as typeof Model).primaryKeys;
  }

  get pkValues(): any[] {
    return (this.primaryKeys as (keyof this)[]).map((key) => this[key]);
  }
}
