import { describe, expect, it } from "vitest";
import {
  CreateInstructionInputSchema,
  ExportRequestSchema,
  InstructionContentSchema,
  VersionStringSchema,
} from "../src";

describe("VersionStringSchema", () => {
  it("strips leading v", () => {
    expect(VersionStringSchema.parse("v1.2.0")).toBe("1.2.0");
  });
  it("accepts prerelease", () => {
    expect(VersionStringSchema.parse("2.0.0-beta.1")).toBe("2.0.0-beta.1");
  });
  it("rejects non semver", () => {
    expect(VersionStringSchema.safeParse("1.2").success).toBe(false);
  });
});

describe("InstructionContentSchema", () => {
  it("fills defaults", () => {
    expect(InstructionContentSchema.parse({})).toEqual({
      activation: { when: [], whenNot: [], requiredContext: [], preferredContext: [] },
      instructions: [],
      body: "",
      tags: [],
    });
  });
  it("trims, dedupes and lowercases tags", () => {
    const c = InstructionContentSchema.parse({ tags: [" API", "api", "", "Backend"] });
    expect(c.tags).toEqual(["api", "backend"]);
  });
});

describe("CreateInstructionInputSchema", () => {
  it("requires kebab-case name", () => {
    expect(CreateInstructionInputSchema.safeParse({ name: "Api Review", displayName: "x" }).success).toBe(false);
  });
  it("applies defaults", () => {
    const v = CreateInstructionInputSchema.parse({ name: "api-review", displayName: "API Review" });
    expect(v.version).toBe("1.0.0");
    expect(v.scope).toBe("general");
    expect(v.status).toBe("draft");
  });
});

describe("ExportRequestSchema", () => {
  it("requires a target", () => {
    expect(ExportRequestSchema.safeParse({ format: "markdown" }).success).toBe(false);
  });
});
