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
  type Relation,
  type SortOrder,
  type StringFilter,
} from "accel-record";

type Class = abstract new (...args: any) => any;

declare module "accel-record" {
  function meta<T>(model: T): Meta<T>;

  /**
   * @namespace Model
   * @description This namespace contains various functions related to model operations.
   */
  namespace Model {
    /**
     * @function build
     * @description Creates a new instance of a model with the provided input.
     * @param {T} this - The model class.
     * @param {Partial<Meta<T>["CreateInput"]>} input - The input data for creating the model instance.
     * @returns {New<T>} - The newly created model instance.
     */
    function build<T extends Class>(this: T, input: Partial<Meta<T>["CreateInput"]>): New<T>;

    /**
     * @function select
     * @description Selects specific attributes from the model instances.
     * @param {T} this - The model class.
     * @param {...(keyof Meta<T>["OrderInput"])[]} attributes - The attributes to select.
     * @returns {Relation<{ [K in F[number]]: InstanceType<T>[K] }, Meta<T>>} - The relation containing the selected attributes.
     */
    function select<T extends Class, F extends (keyof Meta<T>["OrderInput"])[]>(this: T, ...attributes: F): Relation<{ [K in F[number]]: InstanceType<T>[K] }, Meta<T>>;

    /**
     * @function findBy
     * @description Finds a model instance based on the provided input.
     * @param {T} this - The model class.
     * @param {Meta<T>['WhereInput']} input - The input data for finding the model instance.
     * @returns {InstanceType<T> | undefined} - The found model instance, or undefined if not found.
     */
    function findBy<T extends Class>(this: T, input: Meta<T>['WhereInput']): InstanceType<T> | undefined;

    /**
     * @function all
     * @description Retrieves all model instances.
     * @param {T} this - The model class.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing all model instances.
     */
    function all<T extends Class>(this: T): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function order
     * @description Orders the model instances based on the specified attribute and direction.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to order by.
     * @param {"asc" | "desc"} [direction] - The direction of ordering. Default is "asc".
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the ordered model instances.
     */
    function order<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"], direction?: "asc" | "desc"): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function offset
     * @description Sets the offset for retrieving model instances.
     * @param {T} this - The model class.
     * @param {number} offset - The offset value.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the specified offset.
     */
    function offset<T extends Class>(this: T, offset: number): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function limit
     * @description Sets the limit for retrieving model instances.
     * @param {T} this - The model class.
     * @param {number} limit - The limit value.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the specified limit.
     */
    function limit<T extends Class>(this: T, limit: number): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function where
     * @description Filters the model instances based on the provided input.
     * @param {T} this - The model class.
     * @param {Meta<T>['WhereInput']} input - The input data for filtering the model instances.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function where<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function where
     * @description Filters the model instances based on the provided query and bindings.
     * @param {T} this - The model class.
     * @param {string} query - The query string.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function where<T extends Class>(this: T, query: string, ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function where
     * @description Filters the model instances based on the provided query or input and bindings.
     * @param {T} this - The model class.
     * @param {string | Meta<T>['WhereInput']} queryOrInput - The query string or input data for filtering the model instances.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function where<T extends Class>(this: T, queryOrInput: string | Meta<T>['WhereInput'], ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function whereNot
     * @description Filters the model instances based on the provided input, excluding the matching instances.
     * @param {T} this - The model class.
     * @param {Meta<T>['WhereInput']} input - The input data for filtering the model instances.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function whereNot<T extends Class>(this: T, input: Meta<T>['WhereInput']): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function whereRaw
     * @description Filters the model instances based on the provided raw query and bindings.
     * @param {T} this - The model class.
     * @param {string} query - The raw query string.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the filtered model instances.
     */
    function whereRaw<T extends Class>(this: T, query: string, ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function includes
     * @description Eager loads the specified associations for the model instances.
     * @param {T} this - The model class.
     * @param {...Meta<T>['AssociationKey'][]} input - The associations to include.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the included associations.
     */
    function includes<T extends Class>(this: T, ...input: Meta<T>['AssociationKey'][]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function joins
     * @description Performs inner joins with the specified associations for the model instances.
     * @param {T} this - The model class.
     * @param {...Meta<T>['AssociationKey'][]} input - The associations to join.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the joined associations.
     */
    function joins<T extends Class>(this: T, ...input: Meta<T>['AssociationKey'][]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function joinsRaw
     * @description Performs joins with the specified raw query and bindings for the model instances.
     * @param {T} this - The model class.
     * @param {string} query - The raw query string.
     * @param {...any[]} bindings - The query bindings.
     * @returns {Relation<InstanceType<T>, Meta<T>>} - The relation containing the model instances with the joined associations.
     */
    function joinsRaw<T extends Class>(this: T, query: string, ...bindings: any[]): Relation<InstanceType<T>, Meta<T>>;

    /**
     * @function maximum
     * @description Retrieves the maximum value of the specified attribute from the model instances.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to retrieve the maximum value from.
     * @returns {number} - The maximum value of the attribute.
     */
    function maximum<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"]): number;

    /**
     * @function minimum
     * @description Retrieves the minimum value of the specified attribute from the model instances.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to retrieve the minimum value from.
     * @returns {number} - The minimum value of the attribute.
     */
    function minimum<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"]): number;

    /**
     * @function average
     * @description Retrieves the average value of the specified attribute from the model instances.
     * @param {T} this - The model class.
     * @param {keyof Meta<T>["OrderInput"]} attribute - The attribute to retrieve the average value from.
     * @returns {number} - The average value of the attribute.
     */
    function average<T extends Class>(this: T, attribute: keyof Meta<T>["OrderInput"]): number;
  }

  interface Model {
    /**
     * @function isPersisted
     * @description Checks if the model instance is persisted in the database.
     * @returns {boolean} - True if the model instance is persisted, false otherwise.
     */
    isPersisted<T>(this: T): this is Persisted<T>;

    /**
     * @function asPersisted
     * @description Converts the model instance to a persisted instance.
     * @returns {Persisted<T> | undefined} - The persisted instance, or undefined if not persisted.
     */
    asPersisted<T>(this: T): Persisted<T> | undefined;

    /**
     * @function update
     * @description Updates the model instance with the provided input.
     * @param {Partial<Meta<T>["CreateInput"]>} input - The input data for updating the model instance.
     * @returns {boolean} - True if the model instance is updated, false otherwise.
     */
    update<T>(this: T, input: Partial<Meta<T>["CreateInput"]>): this is Persisted<T>;

    /**
     * @function save
     * @description Saves the model instance to the database.
     * @returns {boolean} - True if the model instance is saved, false otherwise.
     */
    save<T>(this: T): this is Persisted<T>;

    /**
     * @function isChanged
     * @description Checks if the model instance has changed.
     * @param {keyof Meta<T>["OrderInput"]} [attr] - The attribute to check for changes. If not provided, checks if any attribute has changed.
     * @returns {boolean} - True if the model instance has changed, false otherwise.
     */
    isChanged<T>(this: T, attr?: keyof Meta<T>["OrderInput"]): boolean;

    /**
     * @function isAttributeChanged
     * @description Checks if the specified attribute of the model instance has changed.
     * @param {keyof Meta<T>["OrderInput"]} attr - The attribute to check for changes.
     * @returns {boolean} - True if the attribute has changed, false otherwise.
     */
    isAttributeChanged<T>(this: T, attr: keyof Meta<T>["OrderInput"]): boolean;
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
