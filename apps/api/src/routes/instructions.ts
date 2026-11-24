import { Hono } from "hono";
import {
  CreateInstructionInputSchema,
  CreateVersionInputSchema,
  DiffQuerySchema,
  InstructionListQuerySchema,
  UpdateInstructionInputSchema,
} from "@air/schema";
import { z } from "zod";
import type { InstructionService } from "../services/instruction-service";
import { validate } from "../validator";

const IdParam = z.object({ id: z.string().uuid() });

export function instructionRoutes(service: InstructionService) {
  return new Hono()
    .get("/", validate("query", InstructionListQuerySchema), async (c) => {
      return c.json(await service.list(c.req.valid("query")));
    })
    .post("/", validate("json", CreateInstructionInputSchema), async (c) => {
      return c.json(await service.create(c.req.valid("json")), 201);
    })
    .get("/:id", validate("param", IdParam), async (c) => {
      return c.json(await service.get(c.req.valid("param").id));
    })
    .put("/:id", validate("param", IdParam), validate("json", UpdateInstructionInputSchema), async (c) => {
      return c.json(await service.update(c.req.valid("param").id, c.req.valid("json")));
    })
    .delete("/:id", validate("param", IdParam), async (c) => {
      await service.delete(c.req.valid("param").id);
      return c.body(null, 204);
    })
    .get("/:id/versions", validate("param", IdParam), async (c) => {
      return c.json(await service.listVersions(c.req.valid("param").id));
    })
    .post("/:id/versions", validate("param", IdParam), validate("json", CreateVersionInputSchema), async (c) => {
      return c.json(await service.createVersion(c.req.valid("param").id, c.req.valid("json")), 201);
    })
    .get("/:id/versions/:version", validate("param", IdParam.extend({ version: z.string() })), async (c) => {
      const { id, version } = c.req.valid("param");
      return c.json(await service.getVersion(id, version));
    })
    .get("/:id/diff", validate("param", IdParam), validate("query", DiffQuerySchema), async (c) => {
      const { from, to } = c.req.valid("query");
      return c.json(await service.diff(c.req.valid("param").id, from, to));
    });
}
