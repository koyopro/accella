import { createCookieSessionStorage } from "accel-web";

// You can define the type of the session object here
export type Session = {
  [key: string]: any;
};

export const { getSession } = createCookieSessionStorage<Session>();
