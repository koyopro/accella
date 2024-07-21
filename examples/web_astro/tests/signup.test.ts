import { experimental_AstroContainer } from "astro/container";
import { Account } from "src/models";
import Signin from "src/pages/signin.astro";

const container = await experimental_AstroContainer.create({});

test("GET", async () => {
  const response = await container.renderToResponse(Signin);
  expect(response.status).toBe(200);
});

const form = (params: Record<string, any>) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value);
  }
  return formData;
};

describe("POST", () => {
  beforeEach(() => {
    Account.create({
      email: "test",
      passwordDigest: "",
      password: "test",
    });
  });

  test("fail", async () => {
    const response = await container.renderToResponse(Signin, {
      request: new Request("https://example.com", {
        method: "POST",
        body: form({ email: "test", password: "invalid" }),
      }),
    });
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain("メールアドレスまたはパスワードが違います");
  });

  test("success", async () => {
    const response = await container.renderToResponse(Signin, {
      request: new Request("https://example.com", {
        method: "POST",
        body: form({ email: "test", password: "test" }),
      }),
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/");
  });
});
