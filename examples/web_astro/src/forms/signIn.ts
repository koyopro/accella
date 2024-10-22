import { Model } from "accel-record";
import { Account } from "src/models";

export class SignIn extends Model {
  email: string = "";
  password: string = "";

  authenticate(): Account | undefined {
    const account = Account.findBy({ email: this.email });
    if (account?.authenticate(this.password)) {
      return account;
    }
  }
}
