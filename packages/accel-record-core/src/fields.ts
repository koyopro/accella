import { BaseDMMF, DMMF } from "prisma/prisma-client/runtime/library.js";

export type Association = {
  klass: string;
  foreignKey: string;
  primaryKey: string;
  table: string;
  field: DMMF.Field;
};

let dmmf: BaseDMMF;

export abstract class Fields {
  static table: string;

  static get fields(): Readonly<DMMF.Field[]> {
    return (
      dmmf.datamodel.models.find(
        (model) => model.name.toLowerCase() === this.table
      )?.fields ?? []
    );
  }

  static get columns() {
    return this.fields
      .filter((f) => f.relationName == undefined)
      .map((field) => field.name);
  }

  static get columns2(): Readonly<DMMF.Field[]> {
    return this.fields.filter((f) => f.relationName == undefined);
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
}
