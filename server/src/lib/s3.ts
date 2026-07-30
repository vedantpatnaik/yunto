import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

/**
 * Presigned-URL helpers for direct browser → S3 uploads. The API never proxies
 * file bytes: it hands out a short-lived PUT URL, the client uploads straight
 * to S3, then posts the resulting file URL back to /uploads/attach.
 *
 * Uploads are optional infrastructure. With S3_BUCKET unset this module still
 * imports cleanly — nothing touches the network or the credential chain at
 * import time — so the server boots exactly as it did before and the routes
 * report 501 instead of crashing.
 */

/** False when S3_BUCKET is unset; routes use this to answer 501 up front. */
export const s3Enabled = Boolean(env.S3_BUCKET);

let client: S3Client | null = null;

/**
 * Built on first use, never at import time. Explicit credentials are passed
 * only when both halves are present; otherwise `credentials: undefined` lets
 * the SDK fall back to its default provider chain (EC2 instance role, etc).
 */
function getClient(): S3Client {
  if (!client) {
    const hasExplicit = Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
    client = new S3Client({
      region: env.AWS_REGION,
      credentials: hasExplicit
        ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
        : undefined,
    });
  }
  return client;
}

/** Origin that fronts the bucket — the CDN override, or the S3 virtual-host URL. */
function publicBase(): string {
  const base =
    env.S3_PUBLIC_BASE_URL || `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
  return base.replace(/\/+$/, "");
}

/** Durable URL to persist on the Attachment row. */
export function fileUrlFor(key: string): string {
  return `${publicBase()}/${key}`;
}

/**
 * Inverse of fileUrlFor — recovers the object key so a stored URL can be
 * re-signed. Returns null for URLs that did not come from our bucket.
 */
export function keyFromUrl(url: string): string | null {
  const prefix = `${publicBase()}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

/**
 * Collision-proof key that keeps the original name legible for downloads.
 * The filename is sanitised because it lands verbatim in the object path.
 */
export function buildKey(filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(-120);
  const day = new Date().toISOString().slice(0, 10);
  return `uploads/${day}/${randomUUID()}-${safe || "file"}`;
}

/** Short-lived URL the client PUTs the file bytes to. */
export function presignPut(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: env.S3_PRESIGN_EXPIRES }
  );
}

/** Short-lived URL for reading an object back out of a private bucket. */
export function presignGet(key: string): Promise<string> {
  return getSignedUrl(getClient(), new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), {
    expiresIn: env.S3_PRESIGN_EXPIRES,
  });
}

/**
 * Best-effort read URL for a stored attachment. Returns null when uploads are
 * off, the URL is external, or signing fails (e.g. unusable credentials) —
 * listing attachments must never 500 just because S3 is misconfigured.
 */
export async function signedUrlForFile(url: string): Promise<string | null> {
  if (!s3Enabled) return null;
  const key = keyFromUrl(url);
  if (!key) return null;
  try {
    return await presignGet(key);
  } catch {
    return null;
  }
}
