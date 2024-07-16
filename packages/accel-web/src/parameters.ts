import { parseFormData } from "parse-nested-form-data";

export class Parameters {
  data: ReturnType<typeof parseFormData>;

  constructor(data: FormData) {
    this.data = parseFormData(data);
  }

  permit<T extends string[]>(...keys: T) {
    return keys.toHash((name) => [name, this.data[name]]);
  }
}
