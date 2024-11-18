import { createCookieSessionStorage } from "accel-web";

export const { getSession } = createCookieSessionStorage<{}>();

export type Session = ReturnType<typeof getSession>;
