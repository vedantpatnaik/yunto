import { Request, Response, NextFunction } from "express";

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.agencyId) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing agency context",
    });
    return;
  }
  req.agencyId = req.user.agencyId;
  next();
}
