import { Model } from "../index.js";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";

/**
 * Represents a secure password type.
 * @template T - The type of the password.
 */
type SecurePassword<T extends string> = {
  new (): {
    [K in T | `${T}Confirmation`]: string | undefined;
  } & {
    /**
     * Authenticates the model instance by comparing the provided password with the stored digest.
     * Returns true if the password matches the digest, false otherwise.
     * @param password - The password to compare with the stored digest.
     * @returns A boolean indicating whether the password matches the stored digest.
     */
    authenticate<M extends Model>(this: M, password: string): boolean;

    /**
     * Validates the attributes of the secure password.
     */
    validateAttributes(): void;
  };
};

/**
 * Creates a class that represents a secure password.
 * @param options.attribute - The name of the password attribute. Default is "password".
 * @param options.validations - Indicates whether to perform validations. Default is true.
 * @returns The class representing a secure password.
 *
 * @example hasSecurePassword()
 * @example hasSecurePassword({ attribute: "recovery", validations: false })
 */
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
