import { PROFILE_FIELDS } from "../profile-fields";

export interface OAuthScope {
  key: string;
  label: string;
  description: string;
  field: string;
  required?: boolean;
}

function generateOAuthScopes(): Record<string, OAuthScope> {
  const scopes: Record<string, OAuthScope> = {};
  
  Object.entries(PROFILE_FIELDS).forEach(([key, field]) => {
    const scopeKey = `profile:${key}`;
    scopes[scopeKey] = {
      key: scopeKey,
      label: field.label,
      description: field.description,
      field: key,
      required: field.required,
    };
  });
  
  return scopes;
}

export const OAUTH_SCOPES = generateOAuthScopes();

export function validateScopes(scopes: string[]): string[] {
  return scopes.filter(scope => scope in OAUTH_SCOPES);
}

export function getScopeFields(scopes: string[]): string[] {
  return scopes
    .filter(scope => scope in OAUTH_SCOPES)
    .map(scope => OAUTH_SCOPES[scope].field);
}
