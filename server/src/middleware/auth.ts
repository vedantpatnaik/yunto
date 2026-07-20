import type { NextFunction, Request, Response } from "express";
import { verifyToken, type JwtPayload } from "../lib/jwt";
import { HttpError } from "./error";

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Missing token");
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    throw new HttpError(401, "Invalid token");
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      throw new HttpError(403, "Forbidden");
    }
    next();
  };
}
