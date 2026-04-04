import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { TokenPayload } from "@yunto/shared";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      agencyId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "Missing token" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    req.agencyId = payload.agencyId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
  }
}
