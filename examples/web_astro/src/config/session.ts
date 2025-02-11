import { type Session as BaseSession, type Options } from "accella/session";
import type { Account } from "../models";

export type SessionData = {
  account: Account;
};

export type Session = BaseSession & Partial<SessionData>;

export const sessionOptions: Options = {
  // cookieName: "astro.session",
  // cookieSetOptions: {
  //   httpOnly: true,
  //   secure: import.meta.env.PROD,
  //   path: undefined,
  //   expires: undefined,
  //   maxAge: undefined,
  // },
};
