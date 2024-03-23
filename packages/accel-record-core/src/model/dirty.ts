import { Model } from "../index.js";

export class Dirty {
  private originalValues: Record<string, any> = {};

  storeOriginalValues(this: Model) {
    for (const column of this.columns2) {
      const attr = column.name;
      this.originalValues[attr] = this[attr as keyof Model];
    }
  }

  isAttributeChanged(this: Model, attr: string): boolean {
    return this[attr as keyof Model] !== this.originalValues[attr];
  }

  isChanged(this: Model, attr?: string): boolean {
    if (attr && attr in this.originalValues) {
      return this.isAttributeChanged(attr);
    }
    for (const column of this.columns2) {
      if (this.isAttributeChanged(column.name)) {
        return true;
      }
    }
    return false;
  }
}
