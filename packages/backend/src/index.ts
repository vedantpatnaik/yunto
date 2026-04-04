import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import { redis } from "./config/redis";
import { errorHandler } from "./middleware/error-handler";
import { setupSocket } from "./socket";

import authRoutes from "./modules/auth/auth.routes";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Socket.io
const io = setupSocket(httpServer);

// Start server
async function start() {
  await redis.connect();
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
    logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
  });
}

start().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});

export { app, io };
