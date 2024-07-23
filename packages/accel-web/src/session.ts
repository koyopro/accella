import { Models, type Model } from "accel-record";
import type { AstroCookies } from "astro";
// @ts-ignore
import pkg from "jsonwebtoken";
const { sign, verify, JsonWebTokenError } = pkg;

type Context = {
  cookies: AstroCookies;
};

export class Session {
  key = "___session";
  data: Record<string, any> = {};
  [key: string]: any;

  constructor(private context: Context) {
    this.secret = this.getSecret();
    const jwt = this.context.cookies.get(this.key)?.value;
    this.restore(jwt);
  }

  protected getSecret() {
    const secretKeyBase = process.env.SECRET_KEY_BASE;
    if (secretKeyBase) {
      return secretKeyBase;
    }
    if (["development", "test"].includes(process.env.NODE_ENV || "")) {
      console.warn("Warning: SECRET_KEY_BASE is not set");
      return "secret-key-base";
    }
    throw new Error("SECRET_KEY_BASE is not set");
  }

  set(key: string, value: any) {
    this.data[key] = value;
    this.save();
  }

  get(key: string) {
    return this.data[key];
  }

  delete(key: string) {
    delete this.data[key];
    this.save();
  }

  store<T extends Model>(resource: T, options?: { scope: string }) {
    const klass = resource.class();
    const scope = options?.scope || klass.name;
    const data = klass.primaryKeys.toHash((k) => [k, resource[k as keyof T]]);
    this.set(scope, { ...data, model: klass.name });
  }

  clear() {
    this.data = {};
    this.save();
  }

  protected restore(jwt: string | undefined) {
    if (!jwt) return;
    try {
      const v = verify(jwt, this.secret, { algorithms: ["HS256"] });
      if (v && typeof v === "object") {
        this.data = v;

        for (const [scope, v] of Object.entries(this.data)) {
          if (v["model"]) {
            const klass = Models[v["model"]];
            if (klass) {
              const data = klass.primaryKeys.toHash((k) => [
                k,
                v[k as keyof typeof v],
              ]);
              this.data[scope] = klass.findBy(data);
            }
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof JsonWebTokenError) {
        // ignore
      } else {
        throw e;
      }
    }
  }

  protected save() {
    const jwt = sign(this.data, this.secret, { algorithm: "HS256" });
    this.context.cookies.set(this.key, jwt);
  }
}

export const createSession = (context: Context) => {
  return new Proxy(new Session(context), {
    get(target, key, receiver) {
      if (["delete", "store", "clear"].includes(key as string)) {
        return Reflect.get(target, key, receiver).bind(target);
      }
      return target.get(key as string);
    },
    set(target, key, value) {
      target.set(key as string, value);
      return true;
    },
  });
};
