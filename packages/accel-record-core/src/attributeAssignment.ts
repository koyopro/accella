import { Fields } from "./fields";

/**
 * Represents a class that assigns attributes to the corresponding fields of an object.
 *
 * This class is intended to be inherited by the Model class.
 */
export class AttributeAssignment {
  /**
   * Assigns the provided attributes to the corresponding fields of the object.
   * Only attributes that match the field names will be assigned.
   *
   * @param attributes - The attributes to assign.
   */
  assignAttributes<T extends Fields>(this: T, attributes: any) {
    for (const column of this.fields) {
      if (column.name in attributes) {
        this[column.name as keyof T] = attributes[column.name];
      }
    }
  }
}
