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

/**
 * Generates REST CRUD (list / get / create / update / delete) for a Prisma model.
 * All routes require auth. create/update bodies are validated with the given schemas.
 */
export function crudRouter(model: Delegate, createSchema: z.ZodTypeAny, updateSchema: z.ZodTypeAny) {
  const r = Router();
  r.use(requireAuth);

  r.get("/", asyncHandler(async (req, res) => {
    const take = Math.min(Number(req.query.take ?? 200), 500);
    res.json(await model.findMany({ take, orderBy: { createdAt: "desc" } }));
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
