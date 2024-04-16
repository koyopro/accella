import { Collection } from "../associations/collectionProxy.js";

function toPascalCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export class Error {
  constructor(
    private attribute: string,
    public message: string
  ) {}

  get fullMessage() {
    return `${toPascalCase(this.attribute)} ${this.message}`;
  }
}

export class Errors {
  private errors = {} as Record<string, Error[]>;

  get fullMessages() {
    return Object.entries(this.errors)
      .map(([, errors]) => errors.map((error) => error.fullMessage))
      .flat();
  }

  add(attribute: string, error: string) {
    (this.errors[attribute] ||= []).push(new Error(attribute, error));
  }

  clear(attribute: string) {
    if (this.errors[attribute]) {
      delete this.errors[attribute];
    }
  }

  clearAll() {
    this.errors = {};
  }

  get(attribute: string) {
    return this.errors[attribute] ?? [];
  }

  isEmpty() {
    return Object.keys(this.errors).length === 0;
  }
}

export class Validator {
  constructor(protected record: any) {}

  get errors(): Errors {
    return this.record.errors;
  }
}

type DefualtOptions = {
  message?: string;
};

type ValidatesOptions = {
  format?: { with: RegExp } & DefualtOptions;
  acceptance?: (boolean | { accept: any | any[] }) & DefualtOptions;
  presence?: boolean & DefualtOptions;
  length?: {
    minimum?: number;
    maximum?: number;
  } & DefualtOptions;
  inclusion?: { in: any[] } & DefualtOptions;
};

export class Validations {
  errors = new Errors();

  isValid() {
    this.validate();
    return this.errors.isEmpty();
  }

  isInvalid() {
    return !this.isValid();
  }

  validate() {
    this.errors.clearAll();
  }

  validatesWith(validator: any) {
    validator.validate();
  }

  validates<T extends keyof this & string>(
    attribute: T | T[],
    options: ValidatesOptions
  ) {
    const _attributes = Array.isArray(attribute) ? attribute : [attribute];
    for (const attribute of _attributes) {
      const value = this[attribute] as any;
      if (options.acceptance) {
        const accept = (typeof options.acceptance === "object"
          ? [options.acceptance.accept].flat()
          : undefined) ?? [true, "1"];
        if (!accept.includes(this[attribute] as any)) {
          this.errors.add(
            attribute,
            options.acceptance.message ?? "must be accepted"
          );
        }
      }
      if (options.presence) {
        if (isBlank(this[attribute])) {
          this.errors.add(
            attribute,
            options.presence.message ?? "can't be blank"
          );
        }
      }
      if (options.length && value != undefined) {
        const { minimum, maximum } = options.length;
        if (minimum && value.length < minimum) {
          this.errors.add(
            attribute,
            options.length.message ??
              `is too short (minimum is ${options.length.minimum} characters)`
          );
        }
        if (maximum && value.length > maximum) {
          this.errors.add(
            attribute,
            options.length.message ??
              `is too long (maximum is ${options.length.maximum} characters)`
          );
        }
      }
      if (options.inclusion && value != undefined) {
        if (!options.inclusion.in.includes(value)) {
          this.errors.add(
            attribute,
            options.inclusion.message ?? "is not included in the list"
          );
        }
      }
      if (options.format && value != undefined) {
        if (!options.format.with.test(value)) {
          this.errors.add(attribute, options.format.message ?? "is invalid");
        }
      }
    }
  }
}

const isBlank = (value: any) => {
  if (typeof value === "string") {
    return value.trim() === "";
  }
  if (Array.isArray(value) || value instanceof Collection) {
    return value.length === 0;
  }
  return value == undefined;
};
