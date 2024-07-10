import { Model } from "../index.js";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";

/**
 * Represents a secure password type.
 * @template T - The type of the password.
 *
 * This type includes dynamically named methods based on the password attribute name:
 * - `[K in T | `${T}Confirmation`]`: Accessors for the password and its confirmation.
 * - `[K in `authenticate${Capitalize<T>}`]`: A method to authenticate the password. This method
 *   compares the provided password with the stored digest and returns true if they match.
 *   Example usage for a password attribute named "password": `instance.authenticatePassword("yourPassword")`.
 *
 * If T is "password", an additional method `authenticate(password: string): boolean` is included.
 */
type SecurePassword<T extends string> = {
  new (): {
    [K in T | `${T}Confirmation`]: string | undefined;
  } & {
    [K in `authenticate${Capitalize<T>}`]: (password: string) => boolean;
  } & (T extends "password"
      ? {
          /**
           * Authenticates the model instance by comparing the provided password with the stored digest.
           * Returns true if the password matches the digest, false otherwise.
           * @param password - The password to compare with the stored digest.
           * @returns A boolean indicating whether the password matches the stored digest.
           */
          authenticate(password: string): boolean;
        }
      : {});
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
  const validations = options.validations ?? true;

  const confirmAttribute = `${attribute}Confirmation`;
  const _attribute = `_${attribute}`;
  const _cofirmAttribute = `_${confirmAttribute}`;
  const authenticate = `authenticate${toPascalCase(attribute)}`;

  // Create an alias for authenticate only when the attribute is "password"
  const authenticateAlias =
    attribute == "password" ? "authenticate" : "__authenticate";
  // @ts-ignore
  return class SecurePassword {
    get [attribute]() {
      return _get(this, _attribute);
    }
    set [attribute](value: string | undefined) {
      const newDigest = value ? hashSync(value, genSaltSync()) : undefined;
      _set(this, `${attribute}Digest`, newDigest);
      _set(this, _attribute, value);
    }
    set [confirmAttribute](value: string) {
      _set(this, _cofirmAttribute, value);
    }
    get [confirmAttribute]() {
      return _get(this, _cofirmAttribute);
    }
    [authenticate]<T extends Model & SecurePassword>(
      this: T,
      password: string
    ) {
      const digest = _get(this, `${attribute}Digest`) as string | undefined;
      return digest ? compareSync(password, digest) : false;
    }
    [authenticateAlias](this: any, password: string) {
      return this[authenticate](password);
    }
    validateAttributes<T extends Model & SecurePassword>(this: T) {
      if (!validations) return;
      const password = _get(this, _attribute);
      const confirm = _get(this, _cofirmAttribute);
      if (password == undefined && confirm == undefined) return;
      this.validates(attribute as any, { presence: true });
      if (password !== confirm) {
        this.errors.add(confirmAttribute, `does not match ${attribute}`);
      }
    }
  };
}

const _get = (obj: any, key: string) => obj[key];
const _set = (obj: any, key: string, value: any) => (obj[key] = value);

const toPascalCase = (str: string) =>
  str.replace(/(^|_)[a-z]/g, (match) => match.at(-1)!.toUpperCase());
