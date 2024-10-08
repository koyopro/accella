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
  assignAttributes(attributes: Record<string, any>) {
    for (const [key, value] of Object.entries(attributes)) {
      this[key as keyof this] = value;
    }
  }
}
