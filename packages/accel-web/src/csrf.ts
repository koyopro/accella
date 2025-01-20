import csrf from "csrf";

const AUTHENTICITY_TOKEN_LENGTH = 32;
const SESSION_KEY = "_csrf_token";

export const formAuthenticityToken = (session: any) => {
  const tokens = newTokens();
  const secret: string = session.get(SESSION_KEY) ?? tokens.secretSync();
  const token = tokens.create(secret);
  session.set(SESSION_KEY, secret);
  return token;
};

export const isValidAuthenticityToken = (session: any, token: string) => {
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
