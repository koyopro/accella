import { experimental_AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { Account } from "src/models";
import Signin from "src/pages/signin.astro";

// @ts-ignore
import pkg from "jsonwebtoken";
const { sign } = pkg;

const container = await experimental_AstroContainer.create({});

let sessionJwt: string | undefined;

describe("GET", async () => {
  test("not logged in", async () => {
    const response = await get(Signin);
    expect(response.status).toBe(200);
  });

  test("logged in", async () => {
    const account = Account.create({
      email: "test",
      passwordDigest: "",
      password: "test",
    });
    signIn(account);

    const response = await get(Signin);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/");

    signOut();
  });
});

describe("POST", () => {
  beforeEach(() => {
    Account.create({
      email: "test",
      passwordDigest: "",
      password: "test",
    });
  });

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

const signIn = (resource: Account) => {
  const secret = "secret-key-base";
  const data = { account_id: resource.id };
  const jwt = sign(data, secret, { algorithm: "HS256" });
  sessionJwt = jwt;
};

const signOut = () => {
  sessionJwt = undefined;
};

const get = async (component: AstroComponentFactory) => {
  return await container.renderToResponse(component, {
    request: new Request("https://example.com", {
      method: "GET",
      headers: {
        Cookie: `___session=${sessionJwt};`,
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
