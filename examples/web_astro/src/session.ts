import { createCookieSessionStorage } from "accel-web";
import type { Account } from "./models";

export type SessionData = {
  account: Account;
};

export const { getSession } = createCookieSessionStorage<SessionData>();

export type Session = ReturnType<typeof getSession>;
