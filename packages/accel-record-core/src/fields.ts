import { BaseDMMF, DMMF } from "prisma/prisma-client/runtime/library.js";

export class Association {
  klass: string;
  foreignKey: string;
  primaryKey: string;
  table: string;
  field: Field;

  constructor(relation: DMMF.Field, association: Field) {
    this.klass = association.type;
    this.foreignKey =
      relation.relationFromFields?.[0] ?? association.foreignKeys?.[0] ?? "";
    this.primaryKey =
      relation.relationToFields?.[0] ?? association.primaryKeys?.[0] ?? "";
    this.table = association.type.toLowerCase();
    this.field = association;
  }

  get isHasOne() {
    return !this.field.isList && !this.isBelongsTo;
  }

  get isBelongsTo() {
    return this.field.relationName?.endsWith(this.klass) ?? false;
  }
}

export class Field {
  name: string;
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

  get columnDefault() {
    if (this.default) {
      const default_ = this.default as any;
      if (default_.name === "autoincrement") {
        return undefined;
      }
      if (this.isList) return [];
      return default_.value;
    }
    if (this.isUpdatedAt) {
      return undefined;
    }
    if (this.isRequired) {
      return this.defaultValue;
    }
    return undefined;
  }

  get defaultValue() {
    switch (this.type) {
      case "BigInt":
      case "Decimal":
      case "Float":
      case "Int":
        return 0;
      case "Bytes":
      case "String":
        return "";
      case "Boolean":
        return false;
      case "DateTime":
        return new Date();
      case "JSON":
        return {};
      default:
        return undefined;
    }
  }
}

let dmmf: BaseDMMF;

export const loadDmmf = async () => {
  const { Prisma } = await import("@prisma/client");
  dmmf = Prisma.dmmf;
};

export class Fields {
  static modelName: string | undefined = undefined;

  private static get model() {
    const modelName = this.modelName ?? this.name;
    const model = dmmf.datamodel.models.find((m) => m.name == modelName);
    if (!model) throw new Error(`Model ${modelName} not found`);
    return model;
  }

  static get table(): string {
    return this.model.dbName ?? toSnakeCase(this.model.name);
  }

  static get fields(): Readonly<Field[]> {
    return (this.model?.fields ?? []).map((field) => new Field(field));
  }

  static get columns() {
    return this.fields
      .filter((f) => f.relationName == undefined)
      .map((field) => field.name);
  }

  static get columns2(): Readonly<Field[]> {
    return this.fields.filter((f) => f.relationName == undefined);
  }

  static get primaryKeys() {
    return (
      this.model?.primaryKey?.fields ??
      this.model?.fields.filter((f) => f.isId).map((f) => f.name) ??
      []
    );
  }

  static get columnsForPersist() {
    return this.fields
      .filter(
        (f) =>
          (f.default as DMMF.FieldDefault | undefined)?.name == "autoincrement"
      )
      .map((field) => field.name);
  }

  static get associations(): Record<string, Association> {
    return this.fields
      .filter((f) => f.relationName != undefined)
      .reduce((acc, field) => {
        const r = dmmf.datamodel.models
          .find((m) => m.name === field.type)
          ?.fields.find((f) => f.relationName === field.relationName);
        if (
          r?.relationFromFields == undefined ||
          r?.relationToFields == undefined
        )
          return acc;
        return {
          ...acc,
          [field.name]: new Association(r, field),
        };
      }, {});
  }

  get fields(): Readonly<Field[]> {
    return (this.constructor as any).fields;
  }

  get columns(): string[] {
    return (this.constructor as any).columns;
  }

  get columns2(): Readonly<Field[]> {
    return (this.constructor as any).columns2;
  }

  get columnsForPersist(): string[] {
    return (this.constructor as any).columnsForPersist;
  }

  get associations(): Record<string, Association> {
    return (this.constructor as any).associations;
  }

  get primaryKeys(): string[] {
    return (this.constructor as any).primaryKeys;
  }
}

function toSnakeCase(str: string): string {
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, "");
}
