import csrf from "csrf";
import { RequestParameters } from "./parameters.js";

const AUTHENTICITY_TOKEN_LENGTH = 32;
const SESSION_KEY = "_csrf_token";

interface Session {
  get(key: string): any;
  set(key: string, value: any): void;
}

export class InvalidAuthenticityToken extends Error {
  constructor() {
    super("Invalid authenticity token");
    this.name = "InvalidAuthenticityToken";
  }
}

/**
 * Generates a form authenticity token for a given session.
 *
 * This function creates a new set of tokens and retrieves the secret from the session.
 * If the secret does not exist in the session, it generates a new secret.
 * It then creates a token using the secret and stores the secret back in the session.
 *
 * @param session - The session object to retrieve and store the secret.
 * @returns The generated form authenticity token.
 */
export const formAuthenticityToken = (session: Session) => {
  const tokens = newTokens();
  const secret: string = session.get(SESSION_KEY) ?? tokens.secretSync();
  const token = tokens.create(secret);
  session.set(SESSION_KEY, secret);
  return token;
};

/**
 * Validates the provided authenticity token against the session's secret.
 *
 * @param session - The current session object containing the secret.
 * @param token - The authenticity token to be validated.
 * @returns `true` if the token is valid, `false` otherwise.
 */
export const isValidAuthenticityToken = (session: Session, token: string) => {
  const secret = session.get(SESSION_KEY) as string | undefined;
  if (!secret) return false;

  const tokens = newTokens();
  return tokens.verify(secret, token);
};

const newTokens = () => {
  return new csrf({
    saltLength: AUTHENTICITY_TOKEN_LENGTH,
    secretLength: AUTHENTICITY_TOKEN_LENGTH,
  });
};

/**
 * Validates the authenticity token from the request parameters against the session.
 * Throws an `InvalidAuthenticityToken` error if the token is invalid and the request method
 * requires a token check (POST, PATCH, DELETE, PUT).
 *
 * @param params - The request parameters containing the authenticity token.
 * @param session - The current session object.
 * @param request - The request object containing the HTTP method.
 * @throws {InvalidAuthenticityToken} If the authenticity token is invalid for the given request method.
 */
export const validateAuthenticityToken = (
  params: RequestParameters,
  session: Session,
  request: Request
) => {
  if (!["POST", "PATCH", "DELETE", "PUT"].includes(request.method)) return;

  const authenticityToken: string =
    params["authenticity_token"] ?? request.headers.get("X-CSRF-Token") ?? "";
  if (!isValidAuthenticityToken(session, authenticityToken)) {
    throw new InvalidAuthenticityToken();
  }
};

/**
 * Defines an `authenticityToken` property on the target object. The property
 * is lazily evaluated and will generate a new authenticity token using the
 * provided session if it is accessed for the first time.
 *
 * @param target - The object on which the `authenticityToken` property will be defined.
 * @param session - The session object used to generate the authenticity token.
 */
export const defineAuthenticityToken = (target: any, session: Session) => {
  let _authenticityToken: string | undefined = undefined;
  Object.defineProperty(target, "authenticityToken", {
    get: () => (_authenticityToken ||= formAuthenticityToken(session)),
    configurable: true,
    enumerable: true,
  });
};
