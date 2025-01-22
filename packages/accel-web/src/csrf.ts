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

export const formAuthenticityToken = (session: Session) => {
  const tokens = newTokens();
  const secret: string = session.get(SESSION_KEY) ?? tokens.secretSync();
  const token = tokens.create(secret);
  session.set(SESSION_KEY, secret);
  return token;
};

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

export const validateAuthenticityToken = (
  params: RequestParameters,
  session: Session,
  request: Request
) => {
  const authenticityToken: string = params["authenticity_token"] ?? "";
  const checkNeeded = ["POST", "PATCH", "DELETE", "PUT"].includes(request.method);
  if (checkNeeded && !isValidAuthenticityToken(session, authenticityToken)) {
    throw new InvalidAuthenticityToken();
  }
};

export const defineAuthenticityToken = (target: any, session: Session) => {
  let _authenticityToken: string | undefined = undefined;
  Object.defineProperty(target, "authenticityToken", {
    get: () => (_authenticityToken ||= formAuthenticityToken(session)),
    configurable: true,
    enumerable: true,
  });
};
