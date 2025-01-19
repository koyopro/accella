import csrf from "csrf";

const AUTHENTICITY_TOKEN_LENGTH = 32;

export const formAuthenticityToken = (session: any) => {
  const tokens = new csrf({
    saltLength: AUTHENTICITY_TOKEN_LENGTH,
    secretLength: AUTHENTICITY_TOKEN_LENGTH,
  });
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  session.set("_csrf_token", token);
  return token;
};
