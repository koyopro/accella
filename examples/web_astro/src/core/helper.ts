import { Helper as HelperBase, Session } from "accel-web";
import { Account } from "../models/index.js";

const key = "account_id";

export class Helper extends HelperBase {
  get currentAccount() {
    return "currentAccount" in this.cache
      ? this.cache.currentAccount
      : (this.cache.currentAccount = getCurrentAccount(this.session));
  }

  logIn = (account: Account) => {
    this.session[key] = account.id;
  };

  logOut = () => {
    this.session.delete(key);
  };

  get needSignIn() {
    const url = new URL(this.context.request.url);
    if (["/signin", "/signup", "/signout"].includes(url.pathname)) return false;

    return this.currentAccount == null;
  }
}

const getCurrentAccount = (session: Session) => {
  const id = session[key];
  return id ? Account.findBy({ id }) : undefined;
};
