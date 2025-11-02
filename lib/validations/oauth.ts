import * as z from "zod";

export const createAppSchema = z.object({
  name: z.string().min(1, "App name is required").max(100),
  description: z.string().max(500).optional(),
  redirectUris: z
    .array(z.string().url("Invalid URL"))
    .min(1, "At least one redirect URI is required")
    .max(10, "Maximum 10 redirect URIs allowed"),
});

export const updateAppSchema = z.object({
  name: z.string().min(1, "App name is required").max(100).optional(),
  description: z.string().max(500).optional(),
  redirectUris: z
    .array(z.string().url("Invalid URL"))
    .min(1, "At least one redirect URI is required")
    .max(10, "Maximum 10 redirect URIs allowed")
    .optional(),
});

export const authorizeSchema = z.object({
  client_id: z.string().min(1, "Client ID is required"),
  redirect_uri: z.string().url("Invalid redirect URI"),
  scope: z.string().optional(),
  state: z.string().optional(),
  response_type: z.literal("code"),
});

export const tokenSchema = z.object({
  grant_type: z.enum(["authorization_code", "refresh_token"]),
  code: z.string().optional(),
  refresh_token: z.string().optional(),
  client_id: z.string().min(1, "Client ID is required"),
  client_secret: z.string().min(1, "Client secret is required"),
  redirect_uri: z.string().url("Invalid redirect URI").optional(),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export type AuthorizeInput = z.infer<typeof authorizeSchema>;
export type TokenInput = z.infer<typeof tokenSchema>;
