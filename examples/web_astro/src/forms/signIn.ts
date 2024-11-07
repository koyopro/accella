import { FormModel } from "accel-record";
import { Account } from "src/models";

export class SignIn extends FormModel {
  email: string = "";
  password: string = "";

  authenticate(): Account | undefined {
    const account = Account.findBy({ email: this.email });
    if (account?.authenticate(this.password)) {
      return account;
    }
  }
}
