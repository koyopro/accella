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
    case "Json":
      return {};
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

const hasAutoGnerateDefault = (field: DMMF.Field) => {
  if (field.default == undefined) return false;
  if (typeof field.default !== "object") return false;
  return ["autoincrement", "now"].includes(
    (field.default as DMMF.FieldDefault)?.name
  );
};

export const generateTypes = (options: GeneratorOptions) => {
  let data = `import type {
  CollectionProxy,
  Filter,
  Relation,
  SortOrder,
  StringFilter,
} from "accel-record";

declare module "accel-record" {
  namespace Model {
    function create<T>(this: T, input: Meta<T>["CreateInput"]): Persisted<T>;
    function first<T>(this: T): Persisted<T>;
    function find<T>(this: T, id: number): Persisted<T>;
    function findBy<T>(this: T, input: Meta<T>['WhereInput']): Persisted<T> | undefined;
    function all<T>(this: T): Relation<Persisted<T>, Meta<T>>;
    function order<T>(this: T, column: keyof Meta<T>["OrderInput"], direction?: "asc" | "desc"): Relation<Persisted<T>, Meta<T>>;
    function offset<T>(this: T, offset: number): Relation<Persisted<T>, Meta<T>>;
    function limit<T>(this: T, limit: number): Relation<Persisted<T>, Meta<T>>;
    function where<T>(this: T, input: Meta<T>['WhereInput']): Relation<Persisted<T>, Meta<T>>;
    function whereNot<T>(this: T, input: Meta<T>['WhereInput']): Relation<Persisted<T>, Meta<T>>;
    function whereRaw<T>(this: T, query: string, bindings?: any[]): Relation<Persisted<T>, Meta<T>>;
    function build<T extends abstract new (...args: any) => any>(this: T, input: Partial<Meta<T>["CreateInput"]>): InstanceType<T>;
    function includes<T>(this: T, input: Meta<T>['AssociationKey'][]): Relation<Persisted<T>, Meta<T>>;
  }
  interface Model {
    isPersisted<T>(this: T): this is Persisted<T>;
    update<T>(this: T, input: Partial<Meta<T>["CreateInput"]>): this is Persisted<T>;
    save<T>(this: T): this is Persisted<T>;
  }
}

type Persisted<T> = Meta<T>["Persisted"];

`;
  const meta = options.dmmf.datamodel.models
    .map(
      (model) =>
        `T extends typeof ${model.name} | ${model.name} ? ${model.name}Meta :`
    )
    .join("\n               ");
  data += `type Meta<T> = ${meta}\n               any;\n`;
  for (const model of options.dmmf.datamodel.models) {
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
        return `    ${field.name}${optional ? "?" : ""}: ${type}${
          field.isList ? "[]" : ""
        };`;
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
    const columnDefines = model.fields
      .map((field) => {
        const optional =
          hasAutoGnerateDefault(field) ||
          !field.isRequired ||
          field.isUpdatedAt;
        const type = getPropertyType(field);
        if (field.relationName && field.isList) {
          return `    ${field.name}: CollectionProxy<${field.type}, ${model.name}Meta>;`;
        }
        return `    ${field.name}: ${type}${field.isList ? "[]" : ""}${
          optional ? " | undefined" : ""
        };`;
      })
      .join("\n");
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
declare module "./${toCamelCase(model.name)}" {
  interface ${model.name} {
${columnDefines}
  }
}
export interface Persisted$${model.name} extends ${model.name} {${columnForPersist(model)}};
type ${model.name}Meta = {
  Persisted: Persisted$${model.name};
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

const associationKey = (model: DMMF.Model) => {
  return model.fields
    .filter((f) => f.relationName)
    .map((f) => `'${f.name}'`)
    .join(" | ");
};

const columnForPersist = (model: DMMF.Model) => {
  return (
    model.fields
      .filter(
        (f) => hasAutoGnerateDefault(f) || f.isUpdatedAt || f.relationName
      )
      .map((f) => {
        const type = getPropertyType(f);
        if (f.isList)
          return `\n  ${f.name}: CollectionProxy<Persisted$${f.type}, ${model.name}Meta>;`;
        if (f.relationName) {
          const optional = f.relationFromFields?.length == 0;
          return `\n  ${f.name}: Persisted$${type}${optional ? " | undefined" : ""};`;
        }
        return `\n  ${f.name}: NonNullable<${model.name}["${f.name}"]>;`;
      })
      .join("") + "\n"
  );
};
