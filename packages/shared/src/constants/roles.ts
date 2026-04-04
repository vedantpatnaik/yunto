export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  SALES_EMPLOYEE: "SALES_EMPLOYEE",
  OPS_MANAGER: "OPS_MANAGER",
  OPS_EMPLOYEE: "OPS_EMPLOYEE",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type Permission =
  | "leads:read"
  | "leads:write"
  | "leads:delete"
  | "campaigns:read"
  | "campaigns:write"
  | "creators:read"
  | "creators:write"
  | "creators:blacklist"
  | "dashboard:read"
  | "dashboard:targets"
  | "team:read"
  | "team:write"
  | "settings:read"
  | "settings:write"
  | "*";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ["*"],
  SALES_MANAGER: [
    "leads:read",
    "leads:write",
    "leads:delete",
    "campaigns:read",
    "creators:read",
    "dashboard:read",
    "dashboard:targets",
    "team:read",
  ],
  SALES_EMPLOYEE: [
    "leads:read",
    "leads:write",
    "campaigns:read",
    "creators:read",
    "dashboard:read",
  ],
  OPS_MANAGER: [
    "campaigns:read",
    "campaigns:write",
    "creators:read",
    "creators:write",
    "dashboard:read",
    "dashboard:targets",
    "team:read",
  ],
  OPS_EMPLOYEE: [
    "campaigns:read",
    "campaigns:write",
    "creators:read",
    "dashboard:read",
  ],
};
