import { formDataToObject } from "astro/actions/runtime/virtual/server.js";
import { z } from "astro/zod";
import { parseFormData } from "parse-nested-form-data";

export class Parameters {
  data: ReturnType<typeof parseFormData>;
  formData: FormData;

  constructor(data: FormData) {
    this.data = parseFormData(data);
    this.formData = data;
  }

  permit<T extends string[]>(...keys: T) {
    return this.parse(z.object(keys.toHash((key) => [key, z.string()])));
  }

  parse(z: any) {
    return formDataToObject(this.formData, z);
  }
}
