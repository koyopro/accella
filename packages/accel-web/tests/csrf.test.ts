import { createCookieSessionStorage } from "src/session";
import { formAuthenticityToken } from "src/csrf";

let data: Record<string, any> = {};
const mockAstroCookies = {
  get: (key: string) => ({ value: data[key] }),
  set: (key: string, value: string | Record<string, any>) => {
    data[key] = value;
  },
} as any;

beforeEach(() => {
  data = {};
});

type SessionData = {
  [key: string]: any;
};

export const { getSession } = createCookieSessionStorage<SessionData>();
const session = getSession(mockAstroCookies);

test("formAuthenticityToken", async () => {
  expect(session.get("_csrf_token")).toBeUndefined();
  const token = formAuthenticityToken(session);
  expect(token.length).toBeGreaterThanOrEqual(60);
  expect(session.get("_csrf_token")?.length).toBeGreaterThanOrEqual(60);
});
