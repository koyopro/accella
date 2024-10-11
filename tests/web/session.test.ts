import { createCookieSessionStorage } from "accel-web";
import { User } from "../models";
import { $user } from "../factories/user";

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
  user: User;
};

test("", () => {
  const { getSession } = createCookieSessionStorage<SessionData>();
  const session = getSession(mockAstroCookies);

  const user = $user.create();
  session.user = user;
  expect(session.user?.equals(user)).toBeTruthy();
});
