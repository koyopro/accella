import { formAuthenticityToken, isValidAuthenticityToken } from "src/csrf";
import { createCookieSessionStorage } from "src/session";

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

export const { getSession } = createCookieSessionStorage();
const session = getSession(mockAstroCookies);

test("formAuthenticityToken()", async () => {
  expect(session.get("_csrf_token")).toBeUndefined();
  const token = formAuthenticityToken(session);
  expect(token.length).toBeGreaterThanOrEqual(60);
  const secret = session.get("_csrf_token");
  expect(secret?.length).toBeGreaterThanOrEqual(40);

  // If a token already exists in the session, it will be reused
  const token2 = formAuthenticityToken(session);
  expect(session.get("_csrf_token")).toBe(secret);
  expect(token2).not.toBe(token);
});

test("isValidAuthenticityToken()", async () => {
  const validSecret = "RK7GvAduF_pYJRbNUCHFS_jFf2QgTkqBIkXujJ7Mn3U";
  const validToken = "AmbcU4bhatotRJfZ3Ictudyq7tgD8ckf-sLYrOVfTTbDR3yMbsnR_KLLHDug";
  const subject = (secret: any, token: string) => {
    session.set("_csrf_token", secret);
    return isValidAuthenticityToken(session, token);
  };
  expect(subject(validSecret, validToken)).toBe(true);
  expect(subject(validSecret, validToken + "a")).toBe(false);
  expect(subject(validSecret + "0", validToken)).toBe(false);
});
