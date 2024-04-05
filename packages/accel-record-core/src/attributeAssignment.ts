import { Fields } from "./fields";

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
