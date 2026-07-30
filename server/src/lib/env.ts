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

  /**
   * S3 file uploads — entirely optional. Leaving S3_BUCKET empty keeps the
   * server booting exactly as before; the /uploads presign route answers 501.
   */
  S3_BUCKET: process.env.S3_BUCKET ?? "",
  /** Matches the default in deploy/aws-env.sh. */
  AWS_REGION: process.env.AWS_REGION ?? "ap-south-1",
  /** Optional — when either is empty the AWS default provider chain is used
   *  (EC2 instance role, ~/.aws/credentials, env vars, ...). */
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  /** Public origin stored in Attachment.url — point at a CDN to serve via CloudFront. */
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL ?? "",
  /** Lifetime of presigned upload/download URLs, in seconds. */
  S3_PRESIGN_EXPIRES: Number(process.env.S3_PRESIGN_EXPIRES ?? 900),
};
