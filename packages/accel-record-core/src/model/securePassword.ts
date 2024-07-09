import { Model } from "../index.js";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";

type SecurePassword<T extends string> = {
  new (): {
    [K in T | `${T}Confirmation`]: string | undefined;
  } & {
    authenticate<M extends Model>(this: M, password: string): boolean;
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
      this.digest =
        value == undefined ? undefined : hashSync(value, genSaltSync());
      this._password = value;
    }
    set [confirmAttribute](value: string) {
      this._passwordConfirmation = value;
    }
    private get digest() {
      return (this as any)[`${attribute}Digest`] as string | undefined;
    }
    private set digest(value: string | undefined) {
      (this as any)[`${attribute}Digest`] = value;
    }
    authenticate<T extends Model & SecurePassword>(this: T, password: string) {
      return this.digest ? compareSync(password, this.digest) : false;
    }
    validateAttributes<T extends Model & SecurePassword>(this: T) {
      if (!validations) return;
      if (
        this._password == undefined &&
        this._passwordConfirmation == undefined
      )
        return;
      this.validates(attribute as any, { presence: true });
      if (this._password !== this._passwordConfirmation) {
        this.errors.add(confirmAttribute, `does not match ${attribute}`);
      }
    }
  };
}
