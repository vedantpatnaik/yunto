import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "../utils/logger";

export function setupSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Missing auth token"));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.agencyId = payload.agencyId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", (socket) => {
    const { agencyId, userId } = socket.data;
    socket.join(`agency:${agencyId}`);
    socket.join(`user:${userId}`);
    logger.debug({ userId, agencyId }, "Socket connected");

    socket.on("disconnect", () => {
      logger.debug({ userId }, "Socket disconnected");
    });
  });

  return io;
}
