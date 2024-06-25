import { Model } from "../index.js";

type SecurePassword<T extends string> = {
  new (): {
    [K in T | `${T}Confirmation`]: string | undefined;
  } & {
    authenticate<M extends Model>(this: M, password: string): false | M;
    validateAttributes(): void;
  };
};

export function hasSecurePassword<T extends string = "password">(
  options: {
    attribute?: T;
    validations?: boolean;
  } = {}
): SecurePassword<T> {
  const attribute = options.attribute ?? "password";
  const confirmAttribute = `${attribute}Confirmation`;
  const validations = options.validations ?? true;
  // @ts-ignore
  return class SecurePassword {
    private _password: string | undefined;
    private _passwordConfirmation: string | undefined;

    get [attribute]() {
      return this._password;
    }
    set [attribute](value: string | undefined) {
      this._password = value;
    }
    set [confirmAttribute](value: string) {
      this._passwordConfirmation = value;
    }
    authenticate<T extends Model & SecurePassword>(
      this: T,
      password: string
    ): false | T {
      if (password === this._password) {
        return this;
      } else {
        return false;
      }
    }
    validateAttributes<T extends Model & SecurePassword>(this: T) {
      if (!validations) return;
      this.validates(attribute as any, { presence: true });
      if (this._password !== this._passwordConfirmation) {
        this.errors.add(confirmAttribute, `does not match ${attribute}`);
      }
    }
  };
}
