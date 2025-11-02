const NAMESPACE = "abbieauth";

export const COLLECTIONS = {
  USERS: `${NAMESPACE}_users`,
  SESSIONS: `${NAMESPACE}_sessions`,
  PHONE_VERIFICATIONS: `${NAMESPACE}_phone_verifications`,
  OAUTH_APPS: `${NAMESPACE}_oauth_apps`,
  OAUTH_GRANTS: `${NAMESPACE}_oauth_grants`,
  OAUTH_AUTHORIZATION_CODES: `${NAMESPACE}_oauth_authorization_codes`,
  OAUTH_REFRESH_TOKENS: `${NAMESPACE}_oauth_refresh_tokens`,
} as const;