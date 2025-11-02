export interface OAuthApp {
  appId: string;
  userId: string;
  name: string;
  description: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OAuthGrant {
  grantId: string;
  userId: string;
  clientId: string;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OAuthRefreshToken {
  tokenId: string;
  userId: string;
  clientId: string;
  tokenHash: string;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

export interface OAuthAuthorizationCode {
  code: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  expiresAt: string;
  used: boolean;
  createdAt: string;
}
