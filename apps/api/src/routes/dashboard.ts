import { Hono } from "hono";
import type { DashboardService } from "../services/dashboard-service";

export function dashboardRoutes(service: DashboardService) {
  return new Hono().get("/", async (c) => c.json(await service.get()));
}
