import { Helper as HelperBase } from "accel-web";
import type { Account } from "src/models";

export class Helper extends HelperBase {
  get currentAccount(): Account {
    return this.session["Account"];
  }

  get needSignIn() {
    const url = new URL(this.context.request.url);
    if (["/signin", "/signup", "/signout"].includes(url.pathname)) return false;

    return this.currentAccount == null;
  }
}
