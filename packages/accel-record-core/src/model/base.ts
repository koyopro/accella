import { Association } from "../associations/association.js";
import { ModelInstanceBuilder } from "../associations/modelInstanceBuilder.js";
import { AttributeAssignment } from "../attributeAssignment.js";
import { Callbacks } from "../callbacks.js";
import { type Model } from "../index.js";
import { Meta, New } from "../meta.js";
import { Mix } from "../utils.js";
import { Attributes } from "./attributes.js";
import { Naming } from "./naming.js";

type FieldsOnly<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

type DefinedProperties<T> = Omit<FieldsOnly<T>, "errors" | "associations" | "callbacks">;

/**
 * Base class for Model
 */
class Base extends Mix(Attributes, AttributeAssignment, Callbacks, Naming) {
  associations: Map<string, Association<Model, Model>> = new Map();

  /**
   * Returns the model class for the current instance.
   *
   * @returns The model class.
   */
  class<T extends typeof Model>(this: InstanceType<T>): T {
    return this.constructor as T;
  }
}

/**
 * Base Model without database access functionality
 */
export class ModelBase extends Base {
  static build<T extends { new (): any }>(
    this: T,
    input: Partial<DefinedProperties<InstanceType<T>>>
  ): InstanceType<T> {
    const instance = new this() as any;
    instance.transformAttributeProperties();
    instance.assignAttributes(input);
    return instance;
  }
}

/**
 * Base Model for creating records
 */
export class RecordBase extends Base {
  /**
   * Builds a new instance of the model using the provided input.
   *
   * @template T - The type of the model.
   * @param input - The input data used to build the model instance.
   * @returns A new instance of the model.
   */
  static build<T extends typeof Model>(this: T, input: Partial<Meta<T>["CreateInput"]>): New<T> {
    const obj = ModelInstanceBuilder.build(this as T, input);
    obj.transformAttributeProperties();
    obj.storeOriginalValues();
    return obj;
  }
}
