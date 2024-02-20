import { Fields } from "./fields";

export class AttributeAssignment {
  assignAttributes<T extends Fields>(this: T, attributes: any) {
    for (const column of this.fields) {
      if (column.name in attributes) {
        this[column.name as keyof T] = attributes[column.name];
      }
    }
  }
}
