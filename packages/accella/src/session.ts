import { createCookieSessionStorage } from "accel-web";
const modules = import.meta.glob("/src/config/session.*", { eager: true });

const options = (Object.values(modules)[0] as any)?.sessionOptions ?? {};

export const { getSession } = createCookieSessionStorage<{}>(options);

export type Session = ReturnType<typeof getSession>;
export type Options = Parameters<typeof createCookieSessionStorage>[0];
