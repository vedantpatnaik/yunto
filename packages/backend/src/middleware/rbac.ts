import { Request, Response, NextFunction } from "express";
import { Permission, ROLE_PERMISSIONS } from "@yunto/shared";

export function rbac(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role];
    if (
      userPermissions.includes("*") ||
      requiredPermissions.every((p) => userPermissions.includes(p))
    ) {
      next();
      return;
    }

    res.status(403).json({
      error: "Forbidden",
      message: "Insufficient permissions",
    });
  };
}
