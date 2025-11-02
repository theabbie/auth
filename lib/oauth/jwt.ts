import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.OAUTH_SECRET_KEY);

export interface AccessTokenPayload {
  sub: string;
  client_id: string;
  scope: string[];
  exp: number;
  iat: number;
}

export interface RefreshTokenPayload {
  sub: string;
  client_id: string;
  token_id: string;
  exp: number;
  iat: number;
}

export async function signAccessToken(
  userId: string,
  clientId: string,
  scopes: string[]
): Promise<string> {
  const payload: AccessTokenPayload = {
    sub: userId,
    client_id: clientId,
    scope: scopes,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  return await new jose.SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

export async function signRefreshToken(
  userId: string,
  clientId: string,
  tokenId: string
): Promise<string> {
  const payload: RefreshTokenPayload = {
    sub: userId,
    client_id: clientId,
    token_id: tokenId,
    exp: Math.floor(Date.now() / 1000) + 2592000,
    iat: Math.floor(Date.now() / 1000),
  };

  return await new jose.SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}
