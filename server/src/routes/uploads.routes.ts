import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../middleware/error";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { buildKey, fileUrlFor, presignPut, s3Enabled, signedUrlForFile } from "../lib/s3";

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(255).default("application/octet-stream"),
});

/**
 * Hands back a short-lived PUT URL. The client uploads the bytes directly to
 * S3, then calls /uploads/attach with the returned fileUrl to record the row.
 */
uploadsRouter.post(
  "/presign",
  asyncHandler(async (req, res) => {
    if (!s3Enabled) {
      throw new HttpError(501, "File uploads are not configured — set S3_BUCKET");
    }
    const { filename, contentType } = presignSchema.parse(req.body);
    const key = buildKey(filename);
    const uploadUrl = await presignPut(key, contentType);
    res.json({ uploadUrl, fileUrl: fileUrlFor(key), key });
  })
);

const attachSchema = z.object({
  url: z.string().url().max(2048),
  filename: z.string().min(1).max(255),
  mimeType: z.string().max(255).optional(),
  size: z.number().int().nonnegative().optional(),
  /** Polymorphic owner, e.g. entityType "Leave" + the Leave row's id. */
  entityType: z.string().max(64).optional(),
  entityId: z.string().max(64).optional(),
});

/**
 * Persists the Attachment row once the upload has landed. Works without S3
 * too — any reachable URL can be attached, which is how external links and
 * already-hosted assets get recorded.
 */
uploadsRouter.post(
  "/attach",
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = attachSchema.parse(req.body);
    const attachment = await prisma.attachment.create({
      data: { ...data, uploaderId: req.user?.sub ?? null },
    });
    res.status(201).json(attachment);
  })
);

/**
 * Attachments hanging off one record, newest first. Each row carries a
 * `signedUrl` for private buckets — null when uploads are off or the file is
 * hosted elsewhere, in which case `url` is already directly fetchable.
 */
uploadsRouter.get(
  "/:entityType/:entityId",
  asyncHandler(async (req, res) => {
    const take = Math.min(Number(req.query.take) || 200, 500);
    // Express's param typing widens to string | string[]; narrow before querying.
    const entityType = String(req.params.entityType);
    const entityId = String(req.params.entityId);
    const attachments = await prisma.attachment.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take,
    });
    res.json(
      await Promise.all(
        attachments.map(async (a) => ({ ...a, signedUrl: await signedUrlForFile(a.url) }))
      )
    );
  })
);
