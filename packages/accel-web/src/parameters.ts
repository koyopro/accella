import { isBlank } from "accel-record-core/dist/validation/validator/presence";
import { parseFormData } from "parse-nested-form-data";
import z from "zod";

type JsonObject = ReturnType<typeof parseFormData>;

export class ParameterMissing extends Error {}

/**
 * Class representing request parameters.
 */
export class RequestParameters {
  readonly [key: string]: any;
  /**
   * Creates an instance of RequestParameters.
   * @param data - The JSON object containing the request data.
   */
  constructor(protected data: JsonObject) {
    Object.entries(data).forEach(([key, value]) => {
      (this as any)[key] ??= value;
    });
  }

  /**
   * Creates an instance of RequestParameters from a Request object.
   * @param request - The Request object to extract parameters from.
   * @returns A promise that resolves to an instance of RequestParameters.
   */
  static async from(request: Request): Promise<RequestParameters> {
    let data = new FormData();
    try {
      data = await request.clone().formData();
    } catch {
      // noop
    }
    new URL(request.url).searchParams.forEach((value, key) => {
      data.append(key, value);
    });
    return new RequestParameters(
      parseFormData(data, {
        transformEntry: ([path, value], defaultTransform) => {
          const ret = defaultTransform([path, value]);
          if (path.startsWith("+")) {
            if (isBlank(value) || !Number.isFinite(ret.value)) {
              ret.value = undefined as any;
            }
          }
          return ret;
        },
      })
    );
  }
  /**
   * Filters the parameters to include only the specified keys.
   * @param keys - The keys to permit.
   * @returns An object containing only the permitted keys.
   */
  permit<T extends string[]>(...keys: T): { [K in T[number]]: any } {
    return keys.toHash((name) => [name, this.data[name]]) as any;
  }
  /**
   * Requires a specific key to be present in the parameters.
   * @param key - The key to require.
   * @returns A new instance of RequestParameters containing the required key's value.
   * @throws ParameterMissing if the key is missing or its value is empty.
   */
  require(key: string): RequestParameters {
    const value = this.data[key];
    if (typeof value !== "object") {
      throw new ParameterMissing(`param is missing or the value is empty: ${key}`);
    }
    return new RequestParameters(value as JsonObject);
  }
  /**
   * Converts the parameters to a JSON object.
   * @returns The JSON object representation of the parameters.
   */
  toHash(): JsonObject {
    return this.data;
  }

  /**
   * Parses the parameters using a Zod schema.
   * @param schema - The Zod schema to parse the parameters with.
   * @returns The parsed data.
   */
  parseWith<T extends z.ZodType<any, any>>(schema: T): z.infer<T> {
    return schema.parse(this.data);
  }
  /**
   * Safely parses the parameters using a Zod schema.
   * @param schema - The Zod schema to parse the parameters with.
   * @returns The result of the safe parse operation.
   */
  safeParseWith<T extends z.ZodType<any, any>>(schema: T) {
    return schema.safeParse(this.data);
  }
}
