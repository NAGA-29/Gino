import { Hono } from "hono";
import { ExportRequestSchema } from "@air/schema";
import { z } from "zod";
import type { ExportService } from "../services/export-service";
import { validate } from "../validator";

export function exportRoutes(service: ExportService) {
  return new Hono()
    .get("/formats", (c) => c.json(service.formats()))
    /**
     * POST /exports
     * ?download=1 を付けるとファイルとして返す。それ以外は ExportResult (JSON)。
     */
    .post(
      "/",
      validate("query", z.object({ download: z.enum(["0", "1", "true", "false"]).optional() })),
      validate("json", ExportRequestSchema),
      async (c) => {
        const result = await service.export(c.req.valid("json"));
        const { download } = c.req.valid("query");
        if (download === "1" || download === "true") {
          return c.body(result.content, 200, {
            "content-type": `${result.mimeType}; charset=utf-8`,
            "content-disposition": `attachment; filename="${result.filename}"`,
          });
        }
        return c.json(result);
      },
    );
}
