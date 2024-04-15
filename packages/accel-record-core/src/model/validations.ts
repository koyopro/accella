export class Errors {
  errors = {};

  add(attribute, error) {
    if (!this.errors[attribute]) {
      this.errors[attribute] = [];
    }
    this.errors[attribute].push(error);
  }

  clear(attribute) {
    if (this.errors[attribute]) {
      delete this.errors[attribute];
    }
  }

  clearAll() {
    this.errors = {};
  }

  get(attribute) {
    return this.errors[attribute];
  }

  has(attribute) {
    return this.errors[attribute] !== undefined;
  }

  isEmpty() {
    return Object.keys(this.errors).length === 0;
  }

  isNotEmpty() {
    return !this.isEmpty();
  }
}

type ValidatesOptions = {
  acceptance?: boolean;
  presence?: boolean;
  length?: { minimum?: number; maximum?: number };
  inclusion?: { in: any[] };
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

  validates(attribute: keyof this, options: ValidatesOptions) {
    const value = this[attribute] as any;
    if (options.acceptance) {
      if (!this[attribute]) {
        this.errors.add(attribute, "must be accepted");
      }
    }
    if (options.presence) {
      if (isBlank(this[attribute])) {
        this.errors.add(attribute, "can't be blank");
      }
    }
    if (options.length && value != undefined) {
      const { minimum, maximum } = options.length;
      if (minimum && value.length < minimum) {
        this.errors.add(
          attribute,
          `is too short (minimum is ${options.length.minimum} characters)`
        );
      }
      if (maximum && value.length > maximum) {
        this.errors.add(
          attribute,
          `is too long (maximum is ${options.length.maximum} characters)`
        );
      }
    }
    if (options.inclusion && value != undefined) {
      if (!options.inclusion.in.includes(value)) {
        this.errors.add(attribute, "is not included in the list");
      }
    }
  }
}

const isBlank = (value: any) => {
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return value == undefined;
};
