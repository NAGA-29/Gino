CREATE TYPE "public"."instruction_scope" AS ENUM('general', 'personal', 'project', 'organization', 'experimental');--> statement-breakpoint
CREATE TYPE "public"."instruction_status" AS ENUM('draft', 'review', 'published', 'deprecated', 'archived');--> statement-breakpoint
CREATE TABLE "instruction_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instruction_id" uuid NOT NULL,
	"version" text NOT NULL,
	"content" jsonb NOT NULL,
	"change_summary" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"scope" "instruction_scope" DEFAULT 'general' NOT NULL,
	"status" "instruction_status" DEFAULT 'draft' NOT NULL,
	"current_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instructions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_instructions" (
	"project_id" uuid NOT NULL,
	"instruction_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_instructions_project_id_instruction_id_pk" PRIMARY KEY("project_id","instruction_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "instruction_versions" ADD CONSTRAINT "instruction_versions_instruction_id_instructions_id_fk" FOREIGN KEY ("instruction_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructions" ADD CONSTRAINT "instructions_current_version_id_instruction_versions_id_fk" FOREIGN KEY ("current_version_id") REFERENCES "public"."instruction_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_instructions" ADD CONSTRAINT "project_instructions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_instructions" ADD CONSTRAINT "project_instructions_instruction_id_instructions_id_fk" FOREIGN KEY ("instruction_id") REFERENCES "public"."instructions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "instruction_versions_instruction_version_uq" ON "instruction_versions" USING btree ("instruction_id","version");