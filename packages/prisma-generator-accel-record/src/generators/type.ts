import { GeneratorOptions } from "@prisma/generator-helper";
import { relationMethods } from "./relation.js";
import { ModelWrapper } from "./wrapper.js";

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

export const generateTypes = async (options: GeneratorOptions) => {
  let data = `import {
  registerModel,
  type Collection,
  type Filter,
  type StringFilter,
} from "accel-record";

declare module "accel-record" {
  function meta<T>(model: T): Meta<T>;

  interface Relation<T, M> {${await relationMethods(options)}}
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
    data += `
declare module "./${model.fileName}" {
  interface ${model.baseModel} {
${columnDefines(model)}
  }
}
export interface ${model.newModel} extends ${model.baseModel} {};
export class ${model.persistedModel} extends ${model.baseModel} {};
export interface ${model.persistedModel} extends ${model.baseModel} {${columnForPersist(model)}};
type ${model.associationKey} = ${associationKey(model)};
type ${model.collection}<T extends ${model.baseModel}> = Collection<T, ${model.meta}> | Collection<${model.persistedModel}, ${model.meta}>;
type ${model.meta} = {
  Base: ${model.baseModel};
  New: ${model.newModel};
  Persisted: ${model.persistedModel};
  AssociationKey: ${model.associationKey};
  JoinInput: ${model.associationKey} | ${model.associationKey}[]${joinInputs(model)};
  Column: {${columnMeta(model)}};
  CreateInput: {${createInputs(model)}}${associationColumns};
  WhereInput: {${whereInputs(model)}};
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

const columnMeta = (model: ModelWrapper) =>
  model.fields
    .filter((f) => !f.relationName && f.type != "Json")
    .map(
      (field) =>
        `\n    ${field.name}: ${field.typeName}${field.isList ? "[]" : ""}${
          field.isRequired ? "" : " | undefined"
        };`
    )
    .join("") + "\n  ";

const createInputs = (model: ModelWrapper) => {
  const relationFromFields = model.fields
    .flatMap((f) => f.relationFromFields)
    .filter((f) => f != undefined);
  return (
    model.fields
      .filter((f) => f.relationFromFields?.[0] == undefined)
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
        const matchPassword = field.name.match(/^(.+)Digest$/);
        if (matchPassword && field.type == "String") {
          const password = matchPassword[1];
          return [
            `\n    ${field.name}?: string;`,
            `\n    ${password}?: string;`,
            `\n    ${password}Confirmation?: string;`,
          ].join("");
        }
        return `\n    ${field.name}${optional ? "?" : ""}: ${valType};`;
      })
      .join("") + "\n  "
  );
};

const whereInputs = (model: ModelWrapper) =>
  model.fields
    .filter((field) => field.type != "Json")
    .map((field) => {
      if (!field.relationName) {
        const type = field.typeName;
        const filter = getFilterType(type);
        return `\n    ${field.name}?: ${type} | ${type}[] | ${filter} | null;`;
      }
      if ((field.relationFromFields?.length ?? 0) == 0) {
        return `\n    ${field.name}?: ${field.model!.meta}['WhereInput'];`;
      }
      return `\n    ${field.name}?: ${field.type} | ${field.type}[] | ${field.model!.meta}['WhereInput'];`;
    })
    .join("") + "\n  ";

const joinInputs = (model: ModelWrapper) => {
  const fields = model.fields.filter((field) => field.relationName);
  if (fields.length == 0) return "";
  const types = fields
    .map(
      (f) => `\n    ${f.name}?: Meta<${f.model!.persistedModel}>['JoinInput'];`
    )
    .join("");
  return ` | {${types}\n  }`;
};
