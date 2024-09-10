import { formDataToObject } from "astro/actions/runtime/virtual/server.js";
import { z } from "astro/zod";

export class Parameters {
  constructor(protected data: FormData) {}

  permit<T extends string[]>(...keys: T) {
    return this.parse(z.object(keys.toHash((key) => [key, z.string()])));
  }

  parse(z: z.ZodObject<any>) {
    return formDataToObject(this.data, z);
  }
}
