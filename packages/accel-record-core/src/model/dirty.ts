import { Model } from "../index.js";
import { Meta } from "../meta.js";

/**
 * Represents a utility class for tracking changes in a model.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Dirty {
  private originalValues: Record<string, any> = {};

  /**
   * Stores the original values of the model's attributes.
   * This method should be called before making any changes to the model.
   */
  storeOriginalValues(this: Model): void {
    this.originalValues = {}; // clear
    for (const { name } of this.columnFields) {
      this.originalValues[name] = this[name as keyof Model];
    }
  }

  /**
   * Checks if a specific attribute of the model has been changed.
   * @param attribute - The name of the attribute to check.
   * @returns A boolean indicating whether the attribute has been changed.
   */
  isAttributeChanged<T extends Model>(
    this: T,
    attribute: keyof Meta<T>["OrderInput"]
  ): boolean {
    return (
      this[attribute as keyof T] !== this.originalValues[attribute as string]
    );
  }

  /**
   * Checks if any attribute of the model has been changed.
   * If an attribute name is provided, only that attribute will be checked.
   * @param attribute - Optional. The name of the attribute to check.
   * @returns A boolean indicating whether any attribute has been changed.
   */
  isChanged<T extends Model>(
    this: T,
    attribute?: keyof Meta<T>["OrderInput"]
  ): boolean {
    if (attribute) {
      return this.isAttributeChanged(attribute);
    }
    for (const { name } of this.columnFields) {
      if (this.isAttributeChanged(name)) {
        return true;
      }
    }
    return false;
  }
}
