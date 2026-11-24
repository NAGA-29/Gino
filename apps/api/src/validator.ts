import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { ZodSchema } from "zod";
import type { ApiErrorBody } from "@air/shared";

/** 共通のエラー形式 (ApiErrorBody) を返す zValidator ラッパー */
export const validate = <T extends ZodSchema, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const body: ApiErrorBody = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: result.error.flatten(),
        },
      };
      return c.json(body, 400);
    }
  });
