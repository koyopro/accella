import { DMMF, GeneratorOptions } from "@prisma/generator-helper";
import { toCamelCase } from "./index.js";

const getFilterType = (type: string) => {
  switch (type) {
    case "string":
      return "StringFilter";
    case "number":
    case "Date":
      return "Filter<number>";
    default:
      return "undefined";
  }
};

class FieldWrapper {
  name: DMMF.Field["name"];
  relationFromFields: DMMF.Field["relationFromFields"];
  hasDefaultValue: DMMF.Field["hasDefaultValue"];
  isRequired: DMMF.Field["isRequired"];
  isList: DMMF.Field["isList"];
  isUpdatedAt: DMMF.Field["isUpdatedAt"];
  type: DMMF.Field["type"];
  relationName: DMMF.Field["relationName"];

  constructor(
    private field: DMMF.Field,
    private datamodel: DMMF.Datamodel
  ) {
    this.name = field.name;
    this.relationFromFields = field.relationFromFields;
    this.hasDefaultValue = field.hasDefaultValue;
    this.isRequired = field.isRequired;
    this.isList = field.isList;
    this.isUpdatedAt = field.isUpdatedAt;
    this.type = field.type;
    this.relationName = field.relationName;
  }

  get hasScalarDefault() {
    return (
      this.field.default != undefined && typeof this.field.default !== "object"
    );
  }

  get typeName() {
    switch (this.field.type) {
      case "BigInt":
      case "Decimal":
      case "Float":
      case "Int":
        return "number";
      case "Bytes":
      case "String":
        return "string";
      case "Boolean":
        return "boolean";
      case "DateTime":
        return "Date";
      case "Json":
        return "any";
      default:
        if (this.datamodel.models.find((m) => m.name == this.field.type)) {
          return `${this.field.type}Model`;
        }
        return `${this.field.type}`;
    }
  }
}

class ModelWrapper {
  constructor(
    private model: DMMF.Model,
    private datamodel: DMMF.Datamodel
  ) {}

  get baseModel() {
    return `${this.model.name}Model`;
  }
  get newModel() {
    return `New${this.model.name}`;
  }
  get persistedModel() {
    return `${this.model.name}`;
  }
  get meta() {
    return `${this.model.name}Meta`;
  }
  get fileName() {
    return toCamelCase(this.model.name);
  }
  get fields() {
    return this.model.fields.map((f) => new FieldWrapper(f, this.datamodel));
  }
}

export const generateTypes = (options: GeneratorOptions) => {
  let data = `import {
  registerModel,
  type CollectionProxy,
  type Filter,
  type Relation,
  type SortOrder,
  type StringFilter,
} from "accel-record";

type Class = abstract new (...args: any) => any;

declare module "accel-record" {
  namespace Model {
    function build<T extends Class>(this: T, input: Partial<Meta<T>["CreateInput"]>): New<T>;
    function create<T extends Class>(this: T, input: Meta<T>["CreateInput"]): InstanceType<T>;
    function first<T extends Class>(this: T): InstanceType<T>;
    function find<T extends Class>(this: T, id: number): InstanceType<T>;
    function findBy<T extends Class>(this: T, input: Meta<T>['WhereInput']): InstanceType<T> | undefined;
    function all<T extends Class>(this: T): Relation<InstanceType<T>, Meta<T>>;
    function order<T extends Class>(this: T, column: keyof Meta<T>["OrderInput"], direction?: "asc" | "desc"): Relation<InstanceType<T>, Meta<T>>;
    function offset<T extends Class>(this: T, offset: number): Relation<InstanceType<T>, Meta<T>>;
    function limit<T extends Class>(this: T, limit: number): Relation<InstanceType<T>, Meta<T>>;
    function where<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;
    function whereNot<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;
    function whereRaw<T extends Class>(this: T, query: string, bindings?: any[]): Relation<InstanceType<T>, Meta<T>>;
    function includes<T extends Class>(this: T, ...input: Meta<T>['AssociationKey'][]): Relation<InstanceType<T>, Meta<T>>;
  }
  interface Model {
    isPersisted<T>(this: T): this is Persisted<T>;
    asPersisted<T>(this: T): Persisted<T> | undefined;
    update<T>(this: T, input: Partial<Meta<T>["CreateInput"]>): this is Persisted<T>;
    save<T>(this: T): this is Persisted<T>;
  }
}

type Persisted<T> = Meta<T>["Persisted"];
type New<T> = Meta<T>["New"];

`;
  const meta = options.dmmf.datamodel.models
    .map((model) => new ModelWrapper(model, options.dmmf.datamodel))
    .map(
      (model) =>
        `T extends typeof ${model.baseModel} | ${model.baseModel} ? ${model.meta} :`
    )
    .join("\n               ");
  data += `type Meta<T> = ${meta}\n               any;\n`;
  data += enumData(options);
  for (const _model of options.dmmf.datamodel.models) {
    const model = new ModelWrapper(_model, options.dmmf.datamodel);
    const reject = (f: FieldWrapper) => f.relationFromFields?.[0] == undefined;
    const relationFromFields = model.fields
      .flatMap((f) => f.relationFromFields)
      .filter((f) => f != undefined);
    const columns = model.fields
      .filter(reject)
      .filter((f) => !relationFromFields.includes(f.name))
      .map((field) => {
        const optional =
          field.hasDefaultValue ||
          !field.isRequired ||
          field.isList ||
          field.isUpdatedAt;
        const valType =
          field.type == "Json"
            ? `${model.baseModel}["${field.name}"]`
            : `${field.typeName}${field.isList ? "[]" : ""}`;
        return `    ${field.name}${optional ? "?" : ""}: ${valType};`;
      })
      .join("\n");
    const associationColumns = model.fields
      .filter((f) => f.relationName && (f.relationFromFields?.length ?? 0) > 0)
      .map((f) => {
        const foreignKeys = model.fields
          .filter((g) => f.relationFromFields?.includes(g.name))
          .map((g) => `${g.name}: ${g.typeName}`)
          .join(", ");
        return ` & ({ ${f.name}: ${f.type} } | { ${foreignKeys} })`;
      })
      .join("");
    const whereInputs =
      model.fields
        .filter(reject)
        .filter(
          (field) => field.relationName == undefined && field.type != "Json"
        )
        .map((field) => {
          const type = field.typeName;
          const filter = getFilterType(type);
          return `\n    ${field.name}?: ${type} | ${type}[] | ${filter} | null;`;
        })
        .join("") + "\n  ";
    const orderInputs =
      model.fields
        .filter(reject)
        .filter((field) => field.relationName == undefined)
        .map((field) => `\n    ${field.name}?: SortOrder;`)
        .join("") + "\n  ";
    data += `
declare module "./${model.fileName}" {
  interface ${model.baseModel} {
${columnDefines(model)}
  }
}
export interface ${model.newModel} extends ${model.baseModel} {};
export class ${model.persistedModel} extends ${model.baseModel} {};
export interface ${model.persistedModel} extends ${model.baseModel} {${columnForPersist(model)}};
type ${model.meta} = {
  New: ${model.newModel};
  Persisted: ${model.persistedModel};
  AssociationKey: ${associationKey(model)};
  CreateInput: {
${columns}
  }${associationColumns};
  WhereInput: {${whereInputs}};
  OrderInput: {${orderInputs}};
};
registerModel(${model.persistedModel});
`;
  }
  return data;
};

const enumData = (options: GeneratorOptions) => {
  if (options.dmmf.datamodel.enums.length == 0) return "";

  let namespaceData = "";
  let enumData = "";

  for (const enumType of options.dmmf.datamodel.enums) {
    namespaceData += `
  export const ${enumType.name} = {
    ${enumType.values.map((v) => `${v.name}: "${v.name}",`).join("\n    ")}
  } as const;
  export type ${enumType.name} = (typeof ${enumType.name})[keyof typeof ${enumType.name}];`;
    enumData += `
export type ${enumType.name} = $Enums.${enumType.name};
export const ${enumType.name} = $Enums.${enumType.name};`;
  }

  return `
export namespace $Enums {${namespaceData}
}
${enumData}
`;
};

const associationKey = (model: ModelWrapper) => {
  return model.fields
    .filter((f) => f.relationName)
    .map((f) => `'${f.name}'`)
    .join(" | ");
};

const columnForPersist = (model: ModelWrapper) => {
  return (
    model.fields
      .filter((f) => {
        if (f.hasScalarDefault || f.isList) return false;
        return f.isRequired || f.relationName;
      })
      .map((f) => {
        if (f.relationName) {
          const optional = f.relationFromFields?.length == 0;
          if (!optional) {
            return `\n  ${f.name}: ${f.type};`;
          }
          return (
            `\n  get ${f.name}(): ${f.type}${optional ? " | undefined" : ""};` +
            `\n  set ${f.name}(value: ${f.typeName}${optional ? " | undefined" : ""});`
          );
        }
        return `\n  ${f.name}: ${f.typeName};`;
      })
      .join("") + "\n"
  );
};

const columnDefines = (model: ModelWrapper) =>
  model.fields
    .map((field) => {
      const type = field.typeName;
      if (field.type == "Json") {
        return `    ${field.name}: ${model.baseModel}["${field.name}"]`;
      }
      if (field.relationName && field.isList) {
        return `    ${field.name}: CollectionProxy<${type}, ${model.meta}>;`;
      }
      if (field.relationName) {
        const optional = field.relationFromFields?.length == 0;
        if (!optional) {
          return `    ${field.name}: ${field.type} | undefined;`;
        }
        return `    ${field.name}: ${type} | undefined;`;
      }
      const nonNullable = field.hasScalarDefault;
      return `    ${field.name}: ${type}${field.isList ? "[]" : ""}${
        nonNullable ? "" : " | undefined"
      };`;
    })
    .join("\n");
