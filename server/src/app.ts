import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./lib/env";
import { router } from "./routes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "yunto-server" }));
app.use("/api", router);

app.use(errorHandler);
