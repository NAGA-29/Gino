import { describe, expect, it } from "vitest";
import { setupTestApp } from "./helpers";

const { app, request } = setupTestApp();

const mk = async (name: string, scope: string, instructions: string[] = []) =>
  (await request("POST", "/instructions", { name, displayName: name, scope, content: { instructions } })).json;

describe("exports API", () => {
  it("lists formats", async () => {
    expect((await request("GET", "/exports/formats")).json).toEqual([{ format: "markdown", label: "Generic Markdown" }]);
  });

  it("exports selected instructions as markdown", async () => {
    const a = await mk("api-review", "general", ["REST semanticsを確認する"]);
    const res = await request("POST", "/exports", { instructionIds: [a.id], format: "markdown" });
    expect(res.status).toBe(200);
    expect(res.json.filename).toBe("api-review.md");
    expect(res.json.content).toContain("- REST semanticsを確認する");
  });

  it("exports a project profile (enabled only, layered)", async () => {
    const { json: p } = await request("POST", "/projects", { name: "Motion Studio" });
    const proj = await mk("motion-studio", "project", ["モーションデータはBVHで扱う"]);
    const gen = await mk("api-review", "general");
    const off = await mk("disabled-one", "general");
    await request("POST", `/projects/${p.id}/instructions`, { instructionId: proj.id });
    await request("POST", `/projects/${p.id}/instructions`, { instructionId: gen.id });
    await request("POST", `/projects/${p.id}/instructions`, { instructionId: off.id, enabled: false });

    const res = await request("POST", "/exports", { projectId: p.id });
    expect(res.json.filename).toBe("motion-studio.md");
    expect(res.json.content).toContain("# Motion Studio — AI Instructions");
    expect(res.json.content).not.toContain("disabled-one");
    expect(res.json.content.indexOf("api-review")).toBeLessThan(res.json.content.indexOf("motion-studio`"));
  });

  it("supports file download", async () => {
    const a = await mk("api-review", "general");
    const res = await app.request("/api/v1/exports?download=1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ instructionIds: [a.id] }),
    });
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="api-review.md"');
    expect(await res.text()).toContain("## api-review");
  });

  it("validates targets and unknown ids", async () => {
    expect((await request("POST", "/exports", { format: "markdown" })).status).toBe(400);
    const res = await request("POST", "/exports", { instructionIds: ["00000000-0000-0000-0000-000000000000"] });
    expect(res.status).toBe(404);
  });
});

describe("dashboard API", () => {
  it("summarizes counts and recent changes", async () => {
    await mk("a", "general");
    await mk("b", "general");
    const c = await mk("c", "personal");
    await request("POST", `/instructions/${c.id}/versions`, { version: "1.1.0", changeSummary: "tweak", content: {} });
    await request("POST", "/projects", { name: "P" });

    const d = (await request("GET", "/dashboard")).json;
    expect(d.total).toBe(3);
    expect(d.byScope).toMatchObject({ general: 2, personal: 1, project: 0 });
    expect(d.byStatus.draft).toBe(3);
    expect(d.projectCount).toBe(1);
    expect(d.recentChanges[0]).toMatchObject({ name: "c", version: "1.1.0", changeSummary: "tweak" });
  });
});
