import { type Session as BaseSession, type Options } from "accella/session";

// You can define the type of the session object here
export type SessionData = {
  [key: string]: any;
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
