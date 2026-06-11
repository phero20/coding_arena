CREATE TABLE "bug_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_academy_exercises" (
	"user_id" uuid NOT NULL,
	"track_slug" text NOT NULL,
	"exercise_slug" text NOT NULL,
	"solved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_academy_exercises_user_id_track_slug_exercise_slug_pk" PRIMARY KEY("user_id","track_slug","exercise_slug")
);
--> statement-breakpoint
ALTER TABLE "chat_threads" RENAME COLUMN "workspace_id" TO "diagram_id";--> statement-breakpoint
ALTER TABLE "chat_threads" DROP CONSTRAINT "chat_threads_workspace_id_workspaces_id_fk";
--> statement-breakpoint
DROP INDEX "chat_threads_workspace_id_idx";--> statement-breakpoint
ALTER TABLE "user_academy_exercises" ADD CONSTRAINT "user_academy_exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_diagram_id_diagrams_id_fk" FOREIGN KEY ("diagram_id") REFERENCES "public"."diagrams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_threads_diagram_id_idx" ON "chat_threads" USING btree ("diagram_id");