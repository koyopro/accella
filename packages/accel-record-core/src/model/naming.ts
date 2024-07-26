import { i18n } from "../i18n.js";

/**
 * Represents a class for handling naming conventions.
 *
 * This class is intended to be inherited by the Model class.
 */
export class Naming {
  /**
   * Gets the model name.
   * @returns An object with a `human` property representing the human-readable model name.
   */
  static get modelName() {
    const default_ = this.name;
    const key = `accelrecord.models.${this.name}`;
    return {
      /**
       * the human-readable model name.
       */
      get human() {
        return i18n?.t(key, "") || default_;
      },
    };
  }

  /**
   * Gets the human-readable attribute name for the specified attribute.
   * @param attribute - The attribute name.
   * @returns The human-readable attribute name.
   */
  static humanAttributeName(attribute: string) {
    const key = `accelrecord.attributes.${this.name}.${attribute}`;
    return i18n?.t(key, "") || toPascalCase(attribute);
  }
}

const toPascalCase = (str: string) => {
  return str
    .replace(/_./g, (s) => s[1].toUpperCase())
    .replace(/^./, (s) => s.toUpperCase());
};
