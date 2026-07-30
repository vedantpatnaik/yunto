import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../middleware/error";
import { requireAuth } from "../middleware/auth";

/** A Prisma model delegate exposes these methods; typed loosely to stay generic. */
type Delegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
};

/** Per-resource overrides for the generated list endpoint. */
export type CrudOptions = {
  /** Sort key. Defaults to `{ createdAt: "desc" }`. */
  orderBy?: Record<string, "asc" | "desc">;
  /** Relations to eager-load, so clients need not make a second round trip. */
  include?: Record<string, boolean>;
};

/**
 * Generates REST CRUD (list / get / create / update / delete) for a Prisma model.
 * All routes require auth. create/update bodies are validated with the given schemas.
 */
export function crudRouter(
  model: Delegate,
  createSchema: z.ZodTypeAny,
  updateSchema: z.ZodTypeAny,
  opts: CrudOptions = {}
) {
  const r = Router();
  r.use(requireAuth);
  // Most models sort newest-first on createdAt, but not every model has that
  // column (Attendance is keyed by `date`), and Prisma throws on an unknown
  // orderBy field. Resources with a different sort key pass it explicitly.
  const orderBy = opts.orderBy ?? { createdAt: "desc" };

  r.get("/", asyncHandler(async (req, res) => {
    const take = Math.min(Number(req.query.take ?? 200), 500);
    res.json(await model.findMany({ take, orderBy, ...(opts.include ? { include: opts.include } : {}) }));
  }));

  r.get("/:id", asyncHandler(async (req, res) => {
    const item = await model.findUnique({ where: { id: req.params.id } });
    if (!item) throw new HttpError(404, "Not found");
    res.json(item);
  }));

  r.post("/", asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    res.status(201).json(await model.create({ data }));
  }));

  r.patch("/:id", asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    res.json(await model.update({ where: { id: req.params.id }, data }));
  }));

  r.delete("/:id", asyncHandler(async (req, res) => {
    await model.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }));

  return r;
}
