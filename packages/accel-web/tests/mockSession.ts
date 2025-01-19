import { createCookieSessionStorage } from "src/session";

let data: Record<string, any> = {};
export const mockAstroCookies = {
  get: (key: string) => ({ value: data[key] }),
  set: (key: string, value: string | Record<string, any>) => {
    data[key] = value;
  },
} as any;
beforeEach(() => {
  data = {};
});

export const { getSession } = createCookieSessionStorage();

export const getMockSession = () => getSession(mockAstroCookies);
