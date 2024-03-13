import { DMMF, GeneratorOptions } from "@prisma/generator-helper";
import { toCamelCase } from "./index.js";

export const getScalarDefault = (field: DMMF.Field) => {
  switch (field.type) {
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
    default:
      return undefined;
  }
};

const getPropertyType = (field: DMMF.Field) => {
  switch (field.type) {
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
      return field.type;
  }
};

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

const hasScalarDefault = (field: DMMF.Field) => {
  return field.default != undefined && typeof field.default !== "object";
};

class ModelWrapper {
  constructor(public model: DMMF.Model) {}
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
    return this.model.fields;
  }
}

export const generateTypes = (options: GeneratorOptions) => {
  let data = `import type {
  CollectionProxy,
  Filter,
  Relation,
  SortOrder,
  StringFilter,
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
    .map((model) => new ModelWrapper(model))
    .map(
      (model) =>
        `T extends typeof ${model.baseModel} | ${model.baseModel} ? ${model.meta} :`
    )
    .join("\n               ");
  data += `type Meta<T> = ${meta}\n               any;\n`;
  data += enumData(options);
  for (const _model of options.dmmf.datamodel.models) {
    const model = new ModelWrapper(_model);
    const reject = (f: DMMF.Field) => f.relationFromFields?.[0] == undefined;
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
        const type = getPropertyType(field);
        const valType =
          field.type == "Json"
            ? `${model.baseModel}["${field.name}"]`
            : `${type}${field.isList ? "[]" : ""}`;
        return `    ${field.name}${optional ? "?" : ""}: ${valType};`;
      })
      .join("\n");
    const associationColumns = model.fields
      .filter((f) => f.relationName && (f.relationFromFields?.length ?? 0) > 0)
      .map((f) => {
        const foreignKeys = model.fields
          .filter((g) => f.relationFromFields?.includes(g.name))
          .map((g) => `${g.name}: ${getPropertyType(g)}`)
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
          const type = getPropertyType(field);
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
        if (hasScalarDefault(f) || f.isList) return false;
        return f.isRequired || f.relationName;
      })
      .map((f) => {
        const type = getPropertyType(f);
        if (f.relationName) {
          const optional = f.relationFromFields?.length == 0;
          return (
            `\n  get ${f.name}(): ${type}${optional ? " | undefined" : ""};` +
            `\n  set ${f.name}(value: ${type}Model${optional ? " | undefined" : ""});`
          );
        }
        return `\n  ${f.name}: NonNullable<${model.baseModel}["${f.name}"]>;`;
      })
      .join("") + "\n"
  );
};

const columnDefines = (model: ModelWrapper) =>
  model.fields
    .map((field) => {
      const type = getPropertyType(field);
      if (field.type == "Json") {
        return `    ${field.name}: ${model.baseModel}["${field.name}"]`;
      }
      if (field.relationName && field.isList) {
        return `    ${field.name}: CollectionProxy<${field.type}, ${model.meta}>;`;
      }
      if (field.relationName) {
        const hasOne = field.relationFromFields?.length == 0;
        const getPrefix = hasOne ? "Model" : "";
        return (
          `    get ${field.name}(): ${type}${getPrefix} | undefined;\n` +
          `    set ${field.name}(value: ${type} | undefined);`
        );
      }
      const nonNullable = hasScalarDefault(field);
      return `    ${field.name}: ${type}${field.isList ? "[]" : ""}${
        nonNullable ? "" : " | undefined"
      };`;
    })
    .join("\n");
