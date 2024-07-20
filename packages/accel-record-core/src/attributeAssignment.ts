import { Fields } from "./fields";

/**
 * Represents a class that assigns attributes to the corresponding fields of an object.
 *
 * This class is intended to be inherited by the Model class.
 */
export class AttributeAssignment {
  /**
   * Assigns the provided attributes to the corresponding fields of the object.
   *
   * @param attributes - The attributes to assign.
   */
  assignAttributes<T extends Fields>(this: T, attributes: Record<string, any>) {
    for (const key in attributes) {
      this[key as keyof T] = attributes[key];
    }
  }
}
