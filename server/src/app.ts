import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./lib/env";
import { router } from "./routes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(helmet());
/**
 * CORS.
 *
 * In development any localhost origin is allowed. The verification harnesses
 * each serve the app on their own port, and every time a new one appeared it
 * was silently blocked — which does not look like an error, it looks like every
 * screen rendering with no data. That failure mode cost several rounds of
 * chasing "dead" screens that were fine.
 *
 * Production keeps the explicit allowlist: `origin` is only ever the configured
 * list there, so this cannot loosen a deployed environment.
 */
const isDev = (process.env.NODE_ENV ?? "development") !== "production";
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl, native apps, same-origin
      if (env.CORS_ORIGIN.includes(origin)) return cb(null, true);
      if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "yunto-server" }));
app.use("/api", router);

app.use(errorHandler);
