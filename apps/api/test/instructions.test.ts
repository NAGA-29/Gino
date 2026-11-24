import { describe, expect, it } from "vitest";
import { setupTestApp } from "./helpers";

const { request } = setupTestApp();

const apiReview = {
  name: "api-design-review",
  displayName: "API Design Review",
  description: "API設計をレビューする。",
  scope: "general",
  status: "published",
  content: {
    activation: { when: ["新規APIを設計する"], whenNot: ["UIのみの変更"] },
    instructions: ["REST semanticsを確認する"],
    tags: ["api", "backend"],
  },
};

describe("instructions API", () => {
  it("creates an instruction with an initial version", async () => {
    const res = await request("POST", "/instructions", apiReview);
    expect(res.status).toBe(201);
    expect(res.json.name).toBe("api-design-review");
    expect(res.json.currentVersion.version).toBe("1.0.0");
    expect(res.json.currentVersion.content.activation.when).toEqual(["新規APIを設計する"]);
    expect(res.json.projects).toEqual([]);
  });

  it("validates input", async () => {
    const res = await request("POST", "/instructions", { name: "Bad Name" });
    expect(res.status).toBe(400);
    expect(res.json.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects duplicate names", async () => {
    await request("POST", "/instructions", apiReview);
    const res = await request("POST", "/instructions", apiReview);
    expect(res.status).toBe(409);
  });

  it("lists with filters", async () => {
    await request("POST", "/instructions", apiReview);
    await request("POST", "/instructions", {
      name: "go-cli",
      displayName: "Go CLI Development",
      scope: "personal",
      content: { tags: ["go"] },
    });

    expect((await request("GET", "/instructions")).json).toHaveLength(2);
    expect((await request("GET", "/instructions?scope=personal")).json.map((i: any) => i.name)).toEqual(["go-cli"]);
    expect((await request("GET", "/instructions?tag=API")).json.map((i: any) => i.name)).toEqual(["api-design-review"]);
    expect((await request("GET", "/instructions?q=cli")).json.map((i: any) => i.name)).toEqual(["go-cli"]);
    expect((await request("GET", "/instructions?status=draft")).json.map((i: any) => i.name)).toEqual(["go-cli"]);
    expect((await request("GET", "/instructions?q=100%25")).json).toEqual([]);
  });

  it("gets, updates metadata and deletes", async () => {
    const { json: created } = await request("POST", "/instructions", apiReview);
    const got = await request("GET", `/instructions/${created.id}`);
    expect(got.json.displayName).toBe("API Design Review");

    const upd = await request("PUT", `/instructions/${created.id}`, { status: "deprecated" });
    expect(upd.status).toBe(200);
    expect(upd.json.status).toBe("deprecated");
    expect(upd.json.currentVersion.version).toBe("1.0.0");

    expect((await request("DELETE", `/instructions/${created.id}`)).status).toBe(204);
    expect((await request("GET", `/instructions/${created.id}`)).status).toBe(404);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request("GET", "/instructions/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
    expect(res.json.error.code).toBe("NOT_FOUND");
  });
});

describe("versions & diff API", () => {
  it("creates versions, lists them semver-desc and diffs", async () => {
    const { json: created } = await request("POST", "/instructions", apiReview);
    const id = created.id;

    const v2 = await request("POST", `/instructions/${id}/versions`, {
      version: "v1.1.0",
      changeSummary: "status code check",
      content: { ...apiReview.content, instructions: ["REST semanticsを確認する", "HTTP status codeを確認する"] },
    });
    expect(v2.status).toBe(201);
    expect(v2.json.version).toBe("1.1.0");

    await request("POST", `/instructions/${id}/versions`, {
      version: "1.10.0",
      content: { ...apiReview.content, activation: { when: ["API境界を設計する"] } },
    });

    const dup = await request("POST", `/instructions/${id}/versions`, { version: "1.1.0", content: {} });
    expect(dup.status).toBe(409);

    const list = await request("GET", `/instructions/${id}/versions`);
    expect(list.json.map((v: any) => v.version)).toEqual(["1.10.0", "1.1.0", "1.0.0"]);

    const detail = await request("GET", `/instructions/${id}`);
    expect(detail.json.currentVersion.version).toBe("1.10.0");

    const one = await request("GET", `/instructions/${id}/versions/v1.1.0`);
    expect(one.json.changeSummary).toBe("status code check");

    const diff = await request("GET", `/instructions/${id}/diff?from=v1.0.0&to=v1.1.0`);
    expect(diff.status).toBe(200);
    expect(diff.json.unified).toContain("+  - HTTP status codeを確認する");
    expect(diff.json.stats).toEqual({ additions: 1, deletions: 0 });
    expect(diff.json.sections.find((s: any) => s.section === "instructions").changed).toBe(true);

    const missing = await request("GET", `/instructions/${id}/diff?from=1.0.0&to=9.9.9`);
    expect(missing.status).toBe(404);
  });
});
