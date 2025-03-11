import { experimental_AstroContainer as AstroContainer } from "astro/container";
import {
  defineAuthenticityToken,
  formAuthenticityToken,
  InvalidAuthenticityToken,
  isValidAuthenticityToken,
  validateAuthenticityToken,
} from "src/csrf";
import CsrfMetaTags from "src/form/csrfMetaTags.astro";
import { RequestParameters } from "src/parameters";
import { getMockSession } from "./mockSession";

const session = getMockSession();
const validSecret = "RK7GvAduF_pYJRbNUCHFS_jFf2QgTkqBIkXujJ7Mn3U";
const validToken = "AmbcU4bhatotRJfZ3Ictudyq7tgD8ckf-sLYrOVfTTbDR3yMbsnR_KLLHDug";

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
  const subject = (secret: any, token: string) => {
    session.set("_csrf_token", secret);
    return isValidAuthenticityToken(session, token);
  };
  expect(subject(validSecret, validToken)).toBe(true);
  expect(subject(validSecret, validToken + "a")).toBe(false);
  expect(subject(validSecret + "0", validToken)).toBe(false);
});

test("CsrfMetaTags", async () => {
  const container = await AstroContainer.create();
  {
    // With authenticityToken
    const result = await container.renderToString(CsrfMetaTags, {
      locals: { authenticityToken: validToken },
    });
    expect(result).toMatch(
      new RegExp(
        '<meta name="csrf-param" content="authenticity_token">' +
          '<meta name="csrf-token" content=".+?">'
      )
    );
  }
  {
    // Without authenticityToken
    const result = await container.renderToString(CsrfMetaTags);
    expect(result).toMatch(
      new RegExp(
        '<meta name="csrf-param" content="authenticity_token"><meta name="csrf-token" content>'
      )
    );
  }
});

test("validateAuthenticityToken()", async () => {
  session.set("_csrf_token", validSecret);
  const result = async (request: Request) => {
    const params = await RequestParameters.from(request);
    validateAuthenticityToken(params, session, request);
  };
  {
    // Valid (parameter)
    const request = new Request(`http://localhost?authenticity_token=${validToken}`, {
      method: "POST",
    });
    await expect(result(request)).resolves.not.toThrow();
  }
  {
    // Valid (X-CSRF-Token header)
    const request = new Request(`http://localhost`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": validToken },
    });
    await expect(result(request)).resolves.not.toThrow();
  }
  {
    // Invalid
    const request = new Request(`http://localhost?authenticity_token=${validToken}a`, {
      method: "POST",
    });
    await expect(result(request)).rejects.toThrow(InvalidAuthenticityToken);
  }
  {
    // Invalid but GET request
    const request = new Request(`http://localhost?authenticity_token=${validToken}a`, {
      method: "GET",
    });
    await expect(result(request)).resolves.not.toThrow();
  }
  {
    // Invalid but Astro Actions
    const request = new Request(`http://localhost/_actions/hello`, {
      method: "POST",
    });
    await expect(result(request)).resolves.not.toThrow();
  }
});

test("defineAuthenticityToken()", async () => {
  const target: any = {};
  expect(target["authenticityToken"]).toBeUndefined();
  // The token should be generated
  defineAuthenticityToken(target, session);
  const token = target["authenticityToken"];
  expect(token).not.toBeUndefined();
  // The token should not be regenerated
  expect(target["authenticityToken"]).toBe(token);
  // readonly property
  expect(() => (target["authenticityToken"] = "test")).toThrowError();
});
