import { Model, Models } from "accel-record";
import { Session as Base, Options, CookieStorage } from "astro-cookie-session";
import { DefaultFlash } from "astro-cookie-session/dist/flash";
import { Cookies } from "astro-cookie-session/dist/storage";

export class Session<T, F> extends Base<T, F> {
  protected recordCache: Map<PropertyKey, any> = new Map();

  override set<K extends keyof T>(key: K, value: T[K]): void {
    if (value instanceof Model) {
      const klass = value.class();
      const data = klass.primaryKeys.toHash((k) => [k, value[k as keyof Model]]);
      this.storage.set(key, { ...data, model: klass.name });
      this.recordCache.delete(key);
    } else {
      super.set(key, value);
    }
  }

  override get<K extends keyof T>(key: K): T[K] | undefined {
    const value = super.get(key);
    return this.retriveInstance(key, value) ?? value;
  }

  protected retriveInstance(key: PropertyKey, value: any): any {
    if (this.recordCache.has(key)) return this.recordCache.get(key);
    const modelName = value?.["model"] as string | undefined;
    if (!modelName) return undefined;
    const klass = Models[modelName];
    if (!klass) return undefined;
    const data = klass.primaryKeys.toHash((k) => [klass.columnToAttribute(k) as string, value[k]]);
    const ret = klass.findBy(data);
    this.recordCache.set(key, ret);
    return ret;
  }
}

export function createCookieSessionStorage<
  T extends Record<string, any> = { [key: string]: any },
  F extends Record<string, any> = DefaultFlash,
>(options?: Options) {
  return {
    getSession: (cookies: Cookies) => Session.from<T, F>(new CookieStorage(cookies, options)),
  };
}
