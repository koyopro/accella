import { isBlank } from "accel-record-core/dist/validation/validator/presence";
import { parseFormData } from "parse-nested-form-data";

type JsonObject = ReturnType<typeof parseFormData>;

export class ParameterMissing extends Error {}

export class RequestParameters {
  constructor(protected data: JsonObject) {}

  static async parse(request: Request): Promise<RequestParameters> {
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
  permit<T extends string[]>(...keys: T): { [K in T[number]]: any } {
    return keys.toHash((name) => [name, this.data[name]]) as any;
  }
  require(key: string): RequestParameters {
    const value = this.data[key];
    if (typeof value !== "object") {
      throw new ParameterMissing(`param is missing or the value is empty: ${key}`);
    }
    return new RequestParameters(value as JsonObject);
  }
  toHash(): JsonObject {
    return this.data;
  }
}
