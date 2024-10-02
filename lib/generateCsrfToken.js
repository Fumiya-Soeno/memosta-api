import { createHash } from "crypto";

export function generateCsrfToken(secret) {
  const token = createHash("sha256").update(secret).digest("base64");
  return token;
}
