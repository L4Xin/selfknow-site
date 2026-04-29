CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"label_zh" text NOT NULL,
	"icon_path" text,
	"category" text
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"placements" jsonb NOT NULL,
	"type_id" text NOT NULL,
	"report_text" text,
	"report_status" text DEFAULT 'pending' NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text,
	"quiz_meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "share_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"event_type" text NOT NULL,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "type_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"label_zh" text NOT NULL,
	"tagline_zh" text NOT NULL,
	"color_pri" text NOT NULL,
	"color_sec" text NOT NULL,
	"emoji" text
);
--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_type_id_type_definitions_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."type_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_events" ADD CONSTRAINT "share_events_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sessions_created" ON "quiz_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_sessions_type" ON "quiz_sessions" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "idx_events_session" ON "share_events" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_events_type" ON "share_events" USING btree ("event_type","created_at");