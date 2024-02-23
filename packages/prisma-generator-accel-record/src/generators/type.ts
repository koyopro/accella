import { DMMF, GeneratorOptions } from "@prisma/generator-helper";

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
    case "JSON":
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
    case "JSON":
      return "object";
    default:
      return field.type;
  }
};

const getFilterType = (type: string) => {
  switch (type) {
    case 'string':
      return 'StringFilter';
    case 'number':
    case 'Date':
      return 'Filter<number>';
    default:
      return 'undefined';
  }
}

const hasAutoGnerateDefault = (field: DMMF.Field) => {
  if (field.default == undefined) return false;
  if (typeof field.default !== "object") return false;
  return (field.default as DMMF.FieldDefault)?.name == "autoincrement";
};

export const generateTypes = (options: GeneratorOptions) => {
  let data = `import { Model, Relation } from "accel-record-core";
import type { CollectionProxy } from "accel-record-core";

type SortOrder = "asc" | "desc";

type Filter<T> = {
  in?: T[];
  '<'?: T;
  '>'?: T;
  '<='?: T;
  '>='?: T;
};

type StringFilter = Filter<string> & {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
};
`;
  for (const model of options.dmmf.datamodel.models) {
    const reject = (f: DMMF.Field) => f.relationFromFields?.[0] == undefined;
    const columns = model.fields
      .filter(reject)
      .map((field) => {
        const optional =
          field.hasDefaultValue || !field.isRequired || field.isList;
        const type = getPropertyType(field);
        return `    ${field.name}${optional ? "?" : ""}: ${type}${
          field.isList ? "[]" : ""
        };`;
      })
      .join("\n");
    const columnDefines = model.fields
      .filter(reject)
      .map((field) => {
        const optional = hasAutoGnerateDefault(field) || !field.isRequired;
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
        .filter((field) => field.relationName == undefined)
        .map((field) => {
          const type = getPropertyType(field);
          const filter = getFilterType(type);
          return `\n      ${field.name}?: ${type} | ${type}[] | ${filter} | null;`
        })
        .join("") + "\n    ";
    const orderInputs =
      model.fields
        .filter(reject)
        .filter((field) => field.relationName == undefined)
        .map((field) => `\n      ${field.name}?: SortOrder;`)
        .join("") + "\n    ";
    data += `
declare module "./${model.name.toLowerCase()}" {
  namespace ${model.name} {
    function create(input: ${model.name}CreateInput): Persisted${model.name};
    function first(): Persisted${model.name};
    function find(id: number): Persisted${model.name};
    function findBy(input: ${model.name}Meta['WhereInput']): Persisted${
      model.name
    } | undefined;
    function all(): Relation<Persisted${model.name}, ${model.name}Meta>;
    function order(column: keyof ${model.name}Meta["OrderInput"], direction?: "asc" | "desc"): Relation<Persisted${model.name}, ${model.name}Meta>;
    function offset(offset: number): Relation<Persisted${model.name}, ${model.name}Meta>;
    function limit(limit: number): Relation<Persisted${model.name}, ${model.name}Meta>;
    function where(input: ${model.name}Meta['WhereInput']): Relation<Persisted${model.name}, ${model.name}Meta>;
    function whereNot(input: ${model.name}Meta['WhereInput']): Relation<Persisted${model.name}, ${model.name}Meta>;
    function whereRaw(query: string, bindings?: any[]): Relation<Persisted${model.name}, ${model.name}Meta>;
    function build(input: Partial<${model.name}CreateInput>): ${model.name};
    function includes<T extends readonly AssociationKey[]>(input: T): Relation<Persisted${model.name}, ${model.name}Meta>;
  }
  interface ${model.name} {
    /* columns */
${columnDefines}

    isPersisted<T extends Model>(this: T): this is Persisted${model.name};
    update(input: Partial<${model.name}CreateInput>): boolean;
  }
  type ${model.name}CreateInput = {
${columns}
  };
  type ${model.name}Meta = {
    WhereInput: {${whereInputs}};
    OrderInput: {${orderInputs}};
  }
  type Persisted${model.name} = ${model.name} & {
    id: NonNullable<${model.name}["id"]>;
  };
  type AssociationKey = "posts";
}
`;
  }
  return data;
};
