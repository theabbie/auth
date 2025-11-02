import { randomBytes, createHash } from "crypto";

export function generateClientId(): string {
  return randomBytes(16).toString("hex");
}

export function generateClientSecret(): string {
  return randomBytes(32).toString("hex");
}

export function generateAuthorizationCode(): string {
  return randomBytes(32).toString("hex");
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function verifySecret(secret: string, hash: string): boolean {
  return hashSecret(secret) === hash;
}

export function generateTokenId(): string {
  return randomBytes(16).toString("hex");
}
