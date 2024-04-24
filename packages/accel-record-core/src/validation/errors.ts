/**
 * Represents an error object.
 */
export class Error {
  /**
   * Creates a new Error instance.
   * @param attribute - The attribute associated with the error.
   * @param message - The error message.
   */
  constructor(
    public attribute: string,
    public message: string
  ) {}

  /**
   * Gets the full error message.
   * @returns The full error message.
   */
  get fullMessage() {
    return `${toPascalCase(this.attribute)} ${this.message}`;
  }
}

/**
 * Represents a collection of errors.
 */
export class Errors {
  private errors = {} as Record<string, Error[]>;

  /**
   * Gets the full error messages.
   * @returns An array of full error messages.
   */
  get fullMessages() {
    return Object.entries(this.errors)
      .map(([, errors]) => errors.map((error) => error.fullMessage))
      .flat();
  }

  /**
   * Adds an error to the collection.
   * @param attribute - The attribute associated with the error.
   * @param error - The error message.
   */
  add(attribute: string, error: string) {
    (this.errors[attribute] ||= []).push(new Error(attribute, error));
  }

  /**
   * Clears the errors for a specific attribute.
   * @param attribute - The attribute to clear errors for.
   */
  clear(attribute: string) {
    if (this.errors[attribute]) {
      delete this.errors[attribute];
    }
  }

  /**
   * Clears all errors in the collection.
   */
  clearAll() {
    this.errors = {};
  }

  /**
   * Gets the errors for a specific attribute.
   * @param attribute - The attribute to get errors for.
   * @returns An array of errors for the specified attribute.
   */
  get(attribute: string) {
    return this.errors[attribute] ?? [];
  }

  /**
   * Checks if the collection is empty.
   * @returns A boolean indicating whether the collection is empty.
   */
  isEmpty() {
    return Object.keys(this.errors).length === 0;
  }
}

function toPascalCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}