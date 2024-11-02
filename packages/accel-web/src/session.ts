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

/**
 * Creates a cookie session storage.
 *
 * @example Standard usage. Specify the type of the session.
 * ```ts
 * type SessionData = {
 *   userId: string;
 * };
 *
 * export const { getSession } = createCookieSessionStorage<SessionData>();
 *
 * const session = getSession(astroCookies);
 * ```
 *
 * @example If no type is specified, any key can be handled with values of any type.
 * ```ts
 * export const { getSession } = createCookieSessionStorage();
 * ```
 *
 * @example Specifying options. The following options are the default values.
 * ```ts
 * export const { getSession } = createCookieSessionStorage({
 *   cookieName: "astro.session",
 *   cookieSetOptions: {
 *     httpOnly: true,
 *     secure: import.meta.env.PROD,
 *     path: undefined,
 *     expires: undefined,
 *     maxAge: undefined,
 *   }
 * });
 * ```
 *
 * @example Specify type for flash messages.
 * ```ts
 * type FlashData = {
 *   success: string;
 *   notice: string;
 *   alert: string;
 *   error: string;
 * };
 *
 * type SessionData = {
 *   userId: string;
 * };
 *
 * export const { getSession } = createCookieSessionStorage<SessionData, FlashData>();
 * ```
 */
export function createCookieSessionStorage<
  T extends Record<string, any> = { [key: string]: any },
  F extends Record<string, any> = DefaultFlash,
>(options?: Options) {
  return {
    /**
     * Prepare a session object from AstroCookies.
     *
     * @example Using in Astro pages.
     * ```ts
     * const session = getSession(Astro.cookies);
     * ```
     *
     * @example Using in Astro API routes.
     * ```ts
     * export const POST: APIRoute = async ({ cookies }) => {
     *   const session = getSession(cookies);
     *   // ...
     * };
     * ```
     */
    getSession: (cookies: Cookies) => Session.from<T, F>(new CookieStorage(cookies, options)),
  };
}
