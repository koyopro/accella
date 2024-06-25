import { Model } from "../index.js";

export const hasSecurePassword = () => {
  let _password: string | undefined = undefined;
  let _passwordConfirmation: string | undefined = undefined;
  return class SecurePassword {
    get password() {
      return _password;
    }
    set password(value: string | undefined) {
      _password = value;
    }
    set passwordConfirmation(value: string) {
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
      this.validates("password", { presence: true });
      if (_password !== _passwordConfirmation) {
        this.errors.add("passwordConfirmation", "does not match password");
      }
    }
  };
};
