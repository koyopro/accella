import { createId as cuid } from "@paralleldrive/cuid2";
import { DMMF } from "prisma/prisma-client/runtime/library.js";
import { isBlank } from "../validation/validator/presence.js";

/**
 * Represents a field in a database table.
 */
export class Field {
  /**
   * The name of the field.
   */
  name: string;

  /**
   * The name of the field in the database.
   */
  dbName: string;

  /**
   * The type of the field.
   */
  type: string;

  /**
   * The name of the related field in a relation, or null if not applicable.
   */
  relationName: string | null;

  /**
   * Indicates whether the field is a list.
   */
  isList: boolean;

  /**
   * Indicates whether the field is required.
   */
  isRequired: boolean;

  /**
   * The kind of the field.
   */
  kind: "scalar" | "object" | "enum" | "unsupported";

  /**
   * Indicates whether the field is an updated timestamp.
   */
  isUpdatedAt: boolean;

  /**
   * The default value of the field.
   */
  default: any;

  /**
   * The foreign keys associated with the field.
   */
  foreignKeys: string[];

  /**
   * The primary keys associated with the field.
   */
  primaryKeys: string[];

  /**
   * Constructs a new Field instance.
   * @param field - The DMMF.Field object representing the field.
   */
  constructor(field: DMMF.Field) {
    this.name = field.name;
    this.dbName = field.dbName ?? field.name;
    this.type = field.type;
    this.relationName = field.relationName?.toString() ?? null;
    this.isList = !!field.isList;
    this.isRequired = !!field.isRequired;
    this.kind = field.kind.toString() as
      | "scalar"
      | "object"
      | "enum"
      | "unsupported";
    this.isUpdatedAt = !!field.isUpdatedAt;
    this.default = field.default?.valueOf() ?? undefined;
    this.foreignKeys = field.relationFromFields?.map((f) => f) ?? [];
    this.primaryKeys = field.relationToFields?.map((f) => f) ?? [];
  }

  /**
   * Checks if the default is "now" function.
   * @returns True if the default value is "now", false otherwise.
   */
  get defaultIsNow() {
    return this.default != undefined && this.default.name === "now";
  }

  /**
   * Checks if the default is "uuid" function.
   * @returns True if the default value is "uuid", false otherwise.
   */
  get defaultIsUuid() {
    return this.default != undefined && this.default.name === "uuid";
  }

  /**
   * Checks if the default is "cuid" function.
   * @returns True if the default value is "cuid", false otherwise.
   */
  get defaultIsCuid() {
    return this.default != undefined && this.default.name === "cuid";
  }

  /**
   * Gets the scalar default value.
   * @returns The scalar default value, or undefined if not applicable.
   */
  get scalarDefault() {
    if (this.default != undefined && typeof this.default != "object") {
      return this.cast(this.default);
    }
    return undefined;
  }

  /**
   * Gets the initial value for the field.
   * @returns The initial value for the field.
   */
  getInitialValue() {
    if (this.defaultIsUuid) return crypto.randomUUID();
    if (this.defaultIsCuid) return cuid();
    return this.scalarDefault;
  }

  /**
   * Casts a value to the appropriate type based on the field's type.
   * @param value - The value to cast.
   * @returns The casted value.
   */
  cast(value: any) {
    if (value == undefined) return value;
    switch (this.type) {
      case "BigInt":
      case "Decimal":
      case "Float":
      case "Int":
        return castNumber(value);
      case "Bytes":
      case "String":
        return String(value);
      case "Boolean":
        return !!value;
      case "DateTime": {
        const date = new Date(value);
        return isInvalidDate(date) ? undefined : date;
      }
      case "JSON":
        return JSON.parse(value);
      default:
        return value;
    }
  }
}

const castNumber = (value: any) => {
  if (isBlank(value)) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const isInvalidDate = (date: Date) => Number.isNaN(date.getTime());
