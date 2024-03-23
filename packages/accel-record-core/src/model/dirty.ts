import { Model } from "../index.js";

export class Dirty {
  private originalValues: Record<string, any> = {};

  storeOriginalValues(this: Model) {
    for (const { name } of this.columns2) {
      this.originalValues[name] = this[name as keyof Model];
    }
  }

  isAttributeChanged(this: Model, attr: string): boolean {
    return this[attr as keyof Model] !== this.originalValues[attr];
  }

  isChanged(this: Model, attr?: string): boolean {
    if (attr) {
      return this.isAttributeChanged(attr);
    }
    for (const { name } of this.columns2) {
      if (this.isAttributeChanged(name)) {
        return true;
      }
    }
    return false;
  }
}
