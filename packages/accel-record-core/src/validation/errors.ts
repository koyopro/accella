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

function toPascalCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
