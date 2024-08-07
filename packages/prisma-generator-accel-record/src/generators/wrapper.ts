import { DMMF } from "@prisma/generator-helper";
import { toCamelCase } from ".";

export class FieldWrapper {
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

export class ModelWrapper {
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
  get associationKey() {
    return `${this.model.name}AssociationKey`;
  }
  get fileName() {
    return toCamelCase(this.model.name);
  }
  get fields() {
    return this.model.fields.map((f) => new FieldWrapper(f, this.datamodel));
  }
}
