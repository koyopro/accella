import { BaseDMMF, DMMF } from "prisma/prisma-client/runtime/library.js";

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

  get isHasOne() {
    return !this.field.isList && !this.isBelongsTo;
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

  get defaultIsNow() {
    return this.default != undefined && this.default.name === "now";
  }
}

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

  static get columns() {
    return this.fields
      .filter((f) => f.relationName == undefined)
      .map((field) => field.dbName);
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
    const myModel = this.model;
    return this.fields
      .filter((f) => f.relationName != undefined)
      .reduce((acc, field) => {
        const rModel = dmmf.datamodel.models.find(
          (m) => m.name === field.type
        )!;
        const r = rModel?.fields.find(
          (f) => f.relationName === field.relationName
        );
        if (
          r?.relationFromFields == undefined ||
          r?.relationToFields == undefined
        )
          return acc;
        const names1 = r.relationToFields.map(
          (name) => myModel.fields.find((f) => f.name === name)?.dbName ?? name
        );
        const names3 = field.primaryKeys.map(
          (name) => rModel.fields.find((f) => f.name === name)?.dbName ?? name
        );
        const names2 = r.relationFromFields.map(
          (name) => rModel.fields.find((f) => f.name === name)?.dbName ?? name
        );
        const names4 = field.foreignKeys.map(
          (name) => myModel.fields.find((f) => f.name === name)?.dbName ?? name
        );

        const foreignKeyColumns = names2.concat(names4);
        const primaryKeyColumns = names1.concat(names3);

        return {
          ...acc,
          ...{
            [field.name]: new Association(
              r,
              field,
              this.primaryKeys,
              foreignKeyColumns,
              primaryKeyColumns
            ),
          },
        };
      }, {});
  }

  get fields(): Readonly<Field[]> {
    return (this.constructor as any).fields;
  }

  findField(name: string): Field | undefined {
    return this.fields.find((f) => f.name === name);
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

  get pkValues(): any[] {
    return (this.primaryKeys as (keyof this)[]).map((key) => this[key]);
  }
}
