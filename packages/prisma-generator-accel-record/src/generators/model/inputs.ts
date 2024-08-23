import { FieldWrapper, ModelWrapper } from "../wrapper";

export const createInputs = (model: ModelWrapper) => {
  const relationFromFields = model.fields
    .flatMap((f) => f.relationFromFields)
    .filter((f) => f != undefined);
  return (
    model.fields
      .filter((f) => f.relationFromFields?.[0] == undefined)
      .filter((f) => !relationFromFields.includes(f.name))
      .map((field) => {
        const valType =
          field.type == "Json"
            ? `${model.baseModel}["${field.name}"]`
            : `${field.typeName}${field.isList ? "[]" : ""}`;
        const matchPassword = field.name.match(/^(.+)Digest$/);
        if (matchPassword && field.type == "String") {
          return passwordFields(field, matchPassword[1]);
        }
        return `\n    ${field.name}${isOptional(field) ? "?" : ""}: ${valType};`;
      })
      .join("") + "\n  "
  );
};

const isOptional = (field: ModelWrapper["fields"][0]) =>
  field.hasDefaultValue || !field.isRequired || field.isList || field.isUpdatedAt;

const passwordFields = (field: FieldWrapper, password: string) =>
  [
    `\n    ${field.name}?: string;`,
    `\n    ${password}?: string;`,
    `\n    ${password}Confirmation?: string;`,
  ].join("");

export const whereInputs = (model: ModelWrapper) =>
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
export const joinInputs = (model: ModelWrapper) => {
  const fields = model.fields.filter((field) => field.relationName);
  if (fields.length == 0) return "";
  const types = fields
    .map((f) => `\n    ${f.name}?: Meta<${f.model!.persistedModel}>['JoinInput'];`)
    .join("");
  return ` | {${types}\n  }`;
};

export const getFilterType = (type: string) => {
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
