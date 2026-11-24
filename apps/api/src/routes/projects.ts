import { Hono } from "hono";
import { CreateProjectInputSchema, ProjectInstructionLinkInputSchema, UpdateProjectInputSchema } from "@air/schema";
import { z } from "zod";
import type { ProjectService } from "../services/project-service";
import { validate } from "../validator";

const IdParam = z.object({ id: z.string().uuid() });
const LinkParam = IdParam.extend({ instructionId: z.string().uuid() });

export function projectRoutes(service: ProjectService) {
  return new Hono()
    .get("/", async (c) => c.json(await service.list()))
    .post("/", validate("json", CreateProjectInputSchema), async (c) => {
      return c.json(await service.create(c.req.valid("json")), 201);
    })
    .get("/:id", validate("param", IdParam), async (c) => c.json(await service.get(c.req.valid("param").id)))
    .put("/:id", validate("param", IdParam), validate("json", UpdateProjectInputSchema), async (c) => {
      return c.json(await service.update(c.req.valid("param").id, c.req.valid("json")));
    })
    .delete("/:id", validate("param", IdParam), async (c) => {
      await service.delete(c.req.valid("param").id);
      return c.body(null, 204);
    })
    .get("/:id/instructions", validate("param", IdParam), async (c) => {
      return c.json(await service.listInstructions(c.req.valid("param").id));
    })
    .post(
      "/:id/instructions",
      validate("param", IdParam),
      validate("json", ProjectInstructionLinkInputSchema),
      async (c) => c.json(await service.linkInstruction(c.req.valid("param").id, c.req.valid("json")), 201),
    )
    .delete("/:id/instructions/:instructionId", validate("param", LinkParam), async (c) => {
      const { id, instructionId } = c.req.valid("param");
      await service.unlinkInstruction(id, instructionId);
      return c.body(null, 204);
    });
}
