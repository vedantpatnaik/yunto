import type { NotificationKind } from "@prisma/client";
import { prisma } from "./prisma";

/** Payload for raising a notification. `kind` falls back to the schema default (SYSTEM). */
export type NotifyInput = {
  kind?: NotificationKind;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
};

/**
 * Raise a notification for a single user.
 *
 * Returns the created row so callers can await it. Callers that must not fail
 * because of a notification should fire and forget: `void notify(...).catch(() => {})`.
 */
export function notify(userId: string, input: NotifyInput) {
  return prisma.notification.create({ data: { userId, ...input } });
}
