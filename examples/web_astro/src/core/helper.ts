import { Helper as HelperBase } from "accel-web";

export class Helper extends HelperBase {
  get currentAccount() {
    return this.session["Account"];
  }

  get needSignIn() {
    const url = new URL(this.context.request.url);
    if (["/signin", "/signup", "/signout"].includes(url.pathname)) return false;

    return this.currentAccount == null;
  }
}
