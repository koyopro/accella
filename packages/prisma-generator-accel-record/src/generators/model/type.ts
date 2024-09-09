import { FieldWrapper, ModelWrapper } from "../wrapper";
import { joinInputs, createInputs, whereInputs } from "./inputs";

export const generateModelTypes = (model: ModelWrapper) => `
declare module "./${model.fileName}" {
  interface ${model.baseModel} {
${columnDefines(model)}
  }
}
export interface ${model.newModel} extends ${model.baseModel} {};
export class ${model.persistedModel} extends ${model.baseModel} {${defineEnumTextTypes(model)}};
export interface ${model.persistedModel} extends ${model.baseModel} {${columnForPersist(model)}};
type ${model.associationKey} = ${associationKey(model)};
type ${model.collection}<T extends ${model.baseModel}> = Collection<T, ${model.meta}> | Collection<${model.persistedModel}, ${model.meta}>;
type ${model.meta} = {
  Base: ${model.baseModel};
  New: ${model.newModel};
  Persisted: ${model.persistedModel};
  PrimaryKey: ${model.primaryKeys};
  AssociationKey: ${model.associationKey};
  Associations: {${associations(model)}};
  JoinInput: ${model.associationKey} | ${model.associationKey}[]${joinInputs(model)};
  Column: {${columnMeta(model)}};
  CreateInput: {${createInputs(model)}}${associationColumns(model)};
  WhereInput: {${whereInputs(model)}};
};
registerModel(${model.persistedModel});
${defineEnumTextAttributes(model)}`;

export const associations = (model: ModelWrapper) => {
  const isHasOne = (f: FieldWrapper) =>
    f.relationName && !f.isList && f.relationFromFields?.length == 0;
  const fields = model.fields.filter(isHasOne);
  if (fields.length == 0) return "";
  const types = fields
    .map((f) => {
      const removeKeys =
        f.model?.fields.find((f_) => f_.relationName === f.relationName)?.relationFromFields ?? [];
      return `\n    ${f.name}: OmitCreateInputKey<${f.model?.persistedModel}, '${removeKeys.join("' | '")}'>;`;
    })
    .join("");
  return `${types}\n  `;
};

const defineEnumTextTypes = (model: ModelWrapper) =>
  model.fields
    .filter((f) => f.kind == "enum")
    .map((f) => `\n  static ${f.name} = new Attribute(this, "${f.typeName}", ${f.typeName});`)
    .join("") + "\n";

const defineEnumTextAttributes = (model: ModelWrapper) =>
  model.fields
    .filter((f) => f.kind == "enum")
    .map(
      (f) => `defineEnumTextAttribute(${model.baseModel}, ${model.persistedModel}, "${f.name}");\n`
    )
    .join("");

const associationColumns = (model: ModelWrapper) =>
  model.fields
    .filter((f) => f.relationName && (f.relationFromFields?.length ?? 0) > 0)
    .map((f) => {
      const foreignKeys = model.fields
        .filter((g) => f.relationFromFields?.includes(g.name))
        .map((g) => `${g.name}: ${g.typeName}`)
        .join(", ");
      return ` & ({ ${f.name}: ${f.type} } | { ${foreignKeys} })`;
    })
    .join("");

const columnDefines = (model: ModelWrapper) =>
  model.fields
    .map((field) => {
      const type = field.typeName;
      if (field.type == "Json") return `    ${field.name}: ${model.baseModel}["${field.name}"]`;

      const m = field.model;
      if (field.relationName && field.isList && m) {
        return (
          `    get ${field.name}(): ${m.collection}<${m.baseModel}>;\n` +
          `    set ${field.name}(value: ${m.baseModel}[]);`
        );
      }
      if (field.relationName) {
        const optional = field.relationFromFields?.length == 0;
        if (!optional) return `    ${field.name}: ${field.type} | undefined;`;
        return `    ${field.name}: ${type} | undefined;`;
      }
      if (field.kind == "enum") return enumFields(field, type);

      const nonNullable = field.hasScalarDefault;
      return `    ${field.name}: ${type}${field.isList ? "[]" : ""}${
        nonNullable ? "" : " | undefined"
      };`;
    })
    .join("\n");

const enumFields = (field: FieldWrapper, type: string) => {
  return [`    ${field.name}: ${type};\n`, `    ${field.name}Text: string;`].join("");
};

const columnForPersist = (model: ModelWrapper) =>
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
        if (!optional) return `\n  ${f.name}: ${f.type};`;

        return (
          `\n  get ${f.name}(): ${f.type}${optional ? " | undefined" : ""};` +
          `\n  set ${f.name}(value: ${f.typeName}${optional ? " | undefined" : ""});`
        );
      }
      return `\n  ${f.name}: ${f.typeName};`;
    })
    .join("") + "\n";

const associationKey = (model: ModelWrapper) => {
  return (
    model.fields
      .filter((f) => f.relationName)
      .map((f) => `'${f.name}'`)
      .join(" | ") || "never"
  );
};

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
