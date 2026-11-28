import { describe, expect, it } from "vitest";
import { InstructionContentSchema } from "@air/schema";
import { bumpVersion, compareSemver, composeProfile, diffContents, suggestBump } from "../src";

const c = (v: unknown) => InstructionContentSchema.parse(v);

describe("semver", () => {
  it("compares numerically", () => {
    const list = ["1.10.0", "1.2.0", "2.0.0", "2.0.0-beta.1", "1.2.1"];
    expect(list.sort(compareSemver)).toEqual(["1.2.0", "1.2.1", "1.10.0", "2.0.0-beta.1", "2.0.0"]);
  });
  it("bumps", () => {
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
    expect(bumpVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(bumpVersion("1.2.3", "patch")).toBe("1.2.4");
  });
});

describe("suggestBump", () => {
  const base = c({ activation: { when: ["API設計"] }, instructions: ["A", "B"], tags: ["api"] });
  it("activation change → major", () => {
    expect(suggestBump(base, c({ ...base, activation: { when: ["Backend"] } }))).toBe("major");
  });
  it("instruction added → minor", () => {
    expect(suggestBump(base, c({ ...base, instructions: ["A", "B", "C"] }))).toBe("minor");
  });
  it("instruction removed → major", () => {
    expect(suggestBump(base, c({ ...base, instructions: ["A"] }))).toBe("major");
  });
  it("wording fix → patch", () => {
    expect(suggestBump(base, c({ ...base, instructions: ["A", "B!"] }))).toBe("patch");
  });
  it("no change → null", () => {
    expect(suggestBump(base, c(base))).toBeNull();
  });
});

describe("diffContents", () => {
  it("produces sectioned diff", () => {
    const from = c({ activation: { when: ["Backend開発時に利用"] }, instructions: ["A"] });
    const to = c({ activation: { when: ["API境界を設計する場合に利用"] }, instructions: ["A"] });
    const d = diffContents({ version: "1.0.0", content: from }, { version: "2.0.0", content: to });
    expect(d.unified).toContain("-    - Backend開発時に利用");
    expect(d.unified).toContain("+    - API境界を設計する場合に利用");
    expect(d.sections.find((s) => s.section === "activation")?.changed).toBe(true);
    expect(d.sections.find((s) => s.section === "instructions")?.changed).toBe(false);
    expect(d.stats).toEqual({ additions: 1, deletions: 1 });
  });
  it("empty diff when identical", () => {
    const x = c({});
    const d = diffContents({ version: "1.0.0", content: x }, { version: "1.0.1", content: x });
    expect(d.unified).toBe("");
    expect(d.stats).toEqual({ additions: 0, deletions: 0 });
  });
});

describe("composeProfile", () => {
  it("orders by layer, priority, name and drops disabled", () => {
    const out = composeProfile([
      { name: "motion-studio", scope: "project", enabled: true, priority: 0 },
      { name: "security-review", scope: "general", enabled: true, priority: 0 },
      { name: "api-review", scope: "general", enabled: true, priority: 0 },
      { name: "personal-policy", scope: "personal", enabled: true, priority: 0 },
      { name: "important", scope: "general", enabled: true, priority: 10 },
      { name: "off", scope: "general", enabled: false, priority: 99 },
    ] as const);
    expect(out.map((e) => e.name)).toEqual(["important", "api-review", "security-review", "personal-policy", "motion-studio"]);
  });
});
