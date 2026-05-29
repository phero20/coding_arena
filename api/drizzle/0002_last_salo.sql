CREATE TABLE "solution_votes" (
	"user_id" uuid NOT NULL,
	"solution_id" uuid NOT NULL,
	"vote_type" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "solution_votes_user_id_solution_id_pk" PRIMARY KEY("user_id","solution_id")
);
--> statement-breakpoint
CREATE TABLE "solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"language" text,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "solution_votes" ADD CONSTRAINT "solution_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_votes" ADD CONSTRAINT "solution_votes_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "solutions_problem_id_idx" ON "solutions" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "solutions_user_id_idx" ON "solutions" USING btree ("user_id");