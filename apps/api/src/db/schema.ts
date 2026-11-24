import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { SCOPES, STATUSES, type InstructionContent } from "@air/schema";

export const scopeEnum = pgEnum("instruction_scope", SCOPES);
export const statusEnum = pgEnum("instruction_status", STATUSES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const instructions = pgTable("instructions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull().default(""),
  scope: scopeEnum("scope").notNull().default("general"),
  status: statusEnum("status").notNull().default("draft"),
  currentVersionId: uuid("current_version_id").references((): AnyPgColumn => instructionVersions.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const instructionVersions = pgTable(
  "instruction_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instructionId: uuid("instruction_id")
      .notNull()
      .references(() => instructions.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    content: jsonb("content").$type<InstructionContent>().notNull(),
    changeSummary: text("change_summary").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("instruction_versions_instruction_version_uq").on(t.instructionId, t.version)],
);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  ...timestamps,
});

export const projectInstructions = pgTable(
  "project_instructions",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    instructionId: uuid("instruction_id")
      .notNull()
      .references(() => instructions.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(true),
    priority: integer("priority").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.instructionId] })],
);

export const instructionsRelations = relations(instructions, ({ one, many }) => ({
  currentVersion: one(instructionVersions, {
    fields: [instructions.currentVersionId],
    references: [instructionVersions.id],
  }),
  versions: many(instructionVersions),
  projectLinks: many(projectInstructions),
}));

export const instructionVersionsRelations = relations(instructionVersions, ({ one }) => ({
  instruction: one(instructions, {
    fields: [instructionVersions.instructionId],
    references: [instructions.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  instructionLinks: many(projectInstructions),
}));

export const projectInstructionsRelations = relations(projectInstructions, ({ one }) => ({
  project: one(projects, { fields: [projectInstructions.projectId], references: [projects.id] }),
  instruction: one(instructions, { fields: [projectInstructions.instructionId], references: [instructions.id] }),
}));
