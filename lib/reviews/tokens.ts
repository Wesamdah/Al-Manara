import crypto from "crypto";

export function generateEditToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashEditToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
