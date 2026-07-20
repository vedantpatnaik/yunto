import "dotenv/config";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  PORT: Number(process.env.PORT ?? 3001),
  /** Comma-separated list so a phone on the LAN can reach the API too. */
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  /** Bind address — 0.0.0.0 exposes the API to devices on the same network. */
  HOST: process.env.HOST ?? "0.0.0.0",
};
