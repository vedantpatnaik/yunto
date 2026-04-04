import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { TokenPayload } from "@yunto/shared";

const privateKey = env.JWT_PRIVATE_KEY.replace(/\\n/g, "\n");
const publicKey = env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  }) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  }) as { userId: string };
}
