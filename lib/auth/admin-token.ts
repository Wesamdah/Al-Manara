import jwt, { JwtPayload } from "jsonwebtoken";

export type AdminTokenPayload = {
  id: string;
  email: string;
  role: string;
};

function getJwtSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return JWT_SECRET;
}

function isAdminTokenPayload(payload: unknown): payload is AdminTokenPayload {
  if (!payload || typeof payload !== "object") return false;

  const data = payload as JwtPayload;

  return (
    typeof data.id === "string" &&
    typeof data.email === "string" &&
    typeof data.role === "string"
  );
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  const payload = jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
  if (!isAdminTokenPayload(payload)) {
    throw new Error("Invalid admin token payload");
  }

  return payload;
}
