import { BaseDMMF, DMMF } from "prisma/prisma-client/runtime/library.js";

export type Association = {
  klass: string;
  foreignKey: string;
  primaryKey: string;
  table: string;
  field: DMMF.Field;
};

export class Field {
  name: string;
  type: string;
  relationName: string | null;
  isList: boolean;
  isRequired: boolean;
  kind: "scalar" | "object" | "enum" | "unsupported";
  isUpdatedAt: boolean;
  default: any;

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

export abstract class Fields {
  static table: string;

  private static get model() {
    return dmmf.datamodel.models.find(
      (model) => model.name.toLowerCase() === this.table
    );
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
    return this.model?.primaryKey?.fields ?? [];
  }

  static get columnsForPersist() {
    return this.fields
      .filter(
        (f) =>
          (f.default as DMMF.FieldDefault | undefined)?.name == "autoincrement"
      )
      .map((field) => field.name);
  }

  static get assosiations(): Record<string, Association> {
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
          [field.name]: {
            klass: field.type,
            foreignKey: r.relationFromFields[0] ?? "",
            primaryKey: r.relationToFields[0] ?? "",
            table: field.type.toLowerCase(),
            field: field,
          },
        };
      }, {});
  }

  get columns(): string[] {
    return (this.constructor as any).columns;
  }

  get columnsForPersist(): string[] {
    return (this.constructor as any).columnsForPersist;
  }

  get assosiations(): Record<string, Association> {
    return (this.constructor as any).assosiations;
  }

  get primaryKeys(): string[] {
    return (this.constructor as any).primaryKeys;
  }
}
