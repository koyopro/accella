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
}
