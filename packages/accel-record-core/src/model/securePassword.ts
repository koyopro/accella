import { Model } from "../index.js";

export const hasSecurePassword = (
  options: { attribute?: string; validations?: boolean } = {}
) => {
  const attribute = options.attribute ?? "password";
  const confirmAttribute = `${attribute}Confirmation`;
  const validations = options.validations ?? true;
  let _password: string | undefined = undefined;
  let _passwordConfirmation: string | undefined = undefined;
  return class SecurePassword {
    get [attribute]() {
      return _password;
    }
    set [attribute](value: string | undefined) {
      _password = value;
    }
    set [confirmAttribute](value: string) {
      _passwordConfirmation = value;
    }
    authenticate<T extends Model>(this: T, password: string): false | T {
      if (password === _password) {
        return this;
      } else {
        return false;
      }
    }
    validateAttributes<T extends Model & { password: string }>(this: T) {
      if (!validations) return;
      this.validates(attribute as any, { presence: true });
      if (_password !== _passwordConfirmation) {
        this.errors.add(confirmAttribute, `does not match ${attribute}`);
      }
    }
  };
};
