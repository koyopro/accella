import { Model } from "../index.js";
import { i18n } from "../model/naming.js";

const defaultMessages: Record<string, string | undefined> = {
  blank: "can't be blank",
  accepted: "must be accepted",
  invalid: "is invalid",
  inclusion: "is not included in the list",
  tooShort: "is too short (minimum is %{count} characters)",
  tooLong: "is too long (maximum is %{count} characters)",
  taken: "has already been taken",
};

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
    private base: Model,
    public attribute: string,
    public message: string,
    private options: { count?: number } = {}
  ) {}

  /**
   * Gets the full error message.
   * @returns The full error message.
   */
  get fullMessage() {
    const attrName = this.base.class().humanAttributeName(this.attribute);
    let message = this.translatedMessage;
    if (this.options.count) {
      message = message.replace("%{count}", this.options.count.toString());
    }
    return `${attrName} ${message}`;
  }

  private get translatedMessage() {
    const model = this.base.constructor.name;
    const keys = [
      `accelrecord.errors.models.${model}.attributes.${this.attribute}.${this.message}`,
      `accelrecord.errors.models.${model}.${this.message}`,
      "accelrecord.errors.messages.blank",
      `errors.attributes.${this.attribute}.${this.message}`,
      `errors.messages.${this.message}`,
    ];
    for (const key of keys) {
      const message = i18n?.t(key, "");
      if (message) return message;
    }
    return defaultMessages[this.message] || this.message;
  }
}

/**
 * Represents a collection of errors.
 */
export class Errors {
  private errors = {} as Record<string, Error[]>;

  constructor(private base: Model) {}

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
  add(attribute: string, error: string, options?: { count: number }) {
    (this.errors[attribute] ||= []).push(
      new Error(this.base, attribute, error, options)
    );
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
