import { describe, expect, it } from "vitest";
import { setupTestApp } from "./helpers";

const { request } = setupTestApp();

const mk = async (name: string, scope: string) =>
  (await request("POST", "/instructions", { name, displayName: name, scope })).json;

describe("projects API", () => {
  it("CRUD", async () => {
    const created = await request("POST", "/projects", { name: "Motion Ginko", description: "motion platform" });
    expect(created.status).toBe(201);
    const id = created.json.id;

    expect((await request("POST", "/projects", { name: "Motion Ginko" })).status).toBe(409);

    const list = await request("GET", "/projects");
    expect(list.json).toMatchObject([{ name: "Motion Ginko", instructionCount: 0 }]);

    const upd = await request("PUT", `/projects/${id}`, { description: "updated" });
    expect(upd.json.description).toBe("updated");

    expect((await request("DELETE", `/projects/${id}`)).status).toBe(204);
    expect((await request("GET", `/projects/${id}`)).status).toBe(404);
  });

  it("builds a project profile ordered by scope layer and priority", async () => {
    const { json: project } = await request("POST", "/projects", { name: "Motion Ginko" });
    const motion = await mk("motion-ginko", "project");
    const policy = await mk("naga-development-policy", "personal");
    const api = await mk("api-review", "general");
    const sec = await mk("security-review", "general");

    for (const i of [motion, policy, api]) {
      expect((await request("POST", `/projects/${project.id}/instructions`, { instructionId: i.id })).status).toBe(201);
    }
    await request("POST", `/projects/${project.id}/instructions`, { instructionId: sec.id, priority: 10 });

    const profile = await request("GET", `/projects/${project.id}/instructions`);
    expect(profile.json.map((p: any) => p.instruction.name)).toEqual([
      "security-review",
      "api-review",
      "naga-development-policy",
      "motion-ginko",
    ]);

    // upsert: 無効化
    await request("POST", `/projects/${project.id}/instructions`, { instructionId: api.id, enabled: false });
    const after = await request("GET", `/projects/${project.id}/instructions`);
    expect(after.json.find((p: any) => p.instruction.id === api.id).enabled).toBe(false);

    // instruction 側にも project が見える / projectId で絞り込める
    const detail = await request("GET", `/instructions/${motion.id}`);
    expect(detail.json.projects).toEqual([{ id: project.id, name: "Motion Ginko" }]);
    const filtered = await request("GET", `/instructions?projectId=${project.id}`);
    expect(filtered.json).toHaveLength(4);

    expect((await request("DELETE", `/projects/${project.id}/instructions/${motion.id}`)).status).toBe(204);
    expect((await request("DELETE", `/projects/${project.id}/instructions/${motion.id}`)).status).toBe(404);
    expect((await request("GET", `/projects/${project.id}/instructions`)).json).toHaveLength(3);
  });

  it("404s when linking an unknown instruction", async () => {
    const { json: project } = await request("POST", "/projects", { name: "X" });
    const res = await request("POST", `/projects/${project.id}/instructions`, {
      instructionId: "00000000-0000-0000-0000-000000000000",
    });
    expect(res.status).toBe(404);
  });
});
