import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { formAuthenticityToken, isValidAuthenticityToken } from "src/csrf";
import CsrfMetaTags from "src/form/csrfMetaTags.astro";
import { getMockSession } from "./mockSession";

const session = getMockSession();

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

test("CsrfMetaTags", async () => {
  const container = await AstroContainer.create();
  const correctRegex = new RegExp(
    '<meta name="csrf-param" content="authenticity_token">' +
      '<meta name="csrf-token" content=".+?">'
  );
  {
    // With session
    const result = await container.renderToString(CsrfMetaTags, {
      locals: { session },
    });
    expect(result).toMatch(correctRegex);
  }
  {
    // Without session
    const result = await container.renderToString(CsrfMetaTags);
    expect(result).toMatch(correctRegex);
  }
});
