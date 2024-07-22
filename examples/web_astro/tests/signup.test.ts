import { createSession } from "accel-web/src/session";
import { experimental_AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { Account } from "src/models";
import Signin from "src/pages/signin.astro";

const container = await experimental_AstroContainer.create({});

beforeEach(() => {
  Account.create({
    email: "test",
    passwordDigest: "",
    password: "test",
  });
});

describe("GET", async () => {
  test("not logged in", async () => {
    const response = await get(Signin);
    expect(response.status).toBe(200);
  });

  test("logged in", async () => {
    signIn(Account.first()!);

    const response = await get(Signin);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/");

    signOut();
  });
});

describe("POST", () => {
  test("fail", async () => {
    const response = await post(Signin, { email: "test", password: "invalid" });
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain("メールアドレスまたはパスワードが違います");
  });

  test("success", async () => {
    const response = await post(Signin, { email: "test", password: "test" });
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/");
  });
});

const form = (params: Record<string, any>) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value);
  }
  return formData;
};

const cookies: any = {};
const signIn = (resource: Account) => {
  const context = {
    cookies: {
      get: () => undefined,
      set: (key: string, value: any) => {
        cookies[key] = value;
      },
    },
  };
  createSession(context as any).store(resource);
};

const signOut = () => {
  delete cookies["___session"];
};

const get = async (component: AstroComponentFactory) => {
  return await container.renderToResponse(component, {
    request: new Request("https://example.com", {
      method: "GET",
      headers: {
        Cookie: `___session=${cookies["___session"]};`,
      },
    }),
  });
};

const post = async (
  component: AstroComponentFactory,
  params: Record<string, any>
) => {
  return await container.renderToResponse(component, {
    request: new Request("https://example.com", {
      method: "POST",
      body: form(params),
    }),
  });
};
