import { DMMF, GeneratorOptions } from "@prisma/generator-helper";
import { toCamelCase } from "./index.js";

const getFilterType = (type: string) => {
  switch (type) {
    case "string":
      return "StringFilter";
    case "number":
    case "Date":
      return `Filter<${type}>`;
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
    if (
      typeof this.field.default === "object" &&
      "name" in this.field.default
    ) {
      return ["uuid", "cuid"].includes(this.field.default.name);
    }
    return (
      this.field.default != undefined && typeof this.field.default !== "object"
    );
  }

  get model() {
    const model = this.datamodel.models.find((m) => m.name == this.field.type);
    if (model) return new ModelWrapper(model, this.datamodel);
    return undefined;
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
        return this.model?.baseModel ?? this.field.type;
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
  get collection() {
    return `${this.model.name}Collection`;
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
  type Collection,
  type Filter,
  type SortOrder,
  type StringFilter,
} from "accel-record";

declare module "accel-record" {
  function meta<T>(model: T): Meta<T>;
}

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
        .filter(
          (field) =>
            (field.relationFromFields?.length ?? 0) > 0 || field.type != "Json"
        )
        .map((field) => {
          const type = field.typeName;
          const filter = getFilterType(type);
          if (field.relationName) {
            return `\n    ${field.name}?: ${field.type} | ${field.type}[];`;
          }
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
type ${model.collection}<T extends ${model.baseModel}> = Collection<T, ${model.meta}> | Collection<${model.persistedModel}, ${model.meta}>;
type ${model.meta} = {
  Base: ${model.baseModel};
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
  return (
    model.fields
      .filter((f) => f.relationName)
      .map((f) => `'${f.name}'`)
      .join(" | ") || "never"
  );
};

const columnForPersist = (model: ModelWrapper) => {
  return (
    model.fields
      .filter((f) => {
        if (f.hasScalarDefault) return false;
        return f.isRequired || f.relationName;
      })
      .map((f) => {
        const m = f.model;
        if (f.relationName && f.isList && m) {
          return (
            `\n  get ${f.name}(): ${m.collection}<${m.persistedModel}>;` +
            `\n  set ${f.name}(value: ${m.baseModel}[]);`
          );
        }
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
      const m = field.model;
      if (field.relationName && field.isList && m) {
        return (
          `    get ${field.name}(): ${m.collection}<${m.baseModel}>;\n` +
          `    set ${field.name}(value: ${m.baseModel}[]);`
        );
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
