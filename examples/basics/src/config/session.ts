import { type Session as BaseSession } from "accella/session";

// You can define the type of the session object here
export type SessionData = {
  [key: string]: any;
};

export type Session = BaseSession & Partial<SessionData>;
