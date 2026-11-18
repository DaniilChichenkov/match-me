CREATE TABLE "user_bio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"music" varchar(255) NOT NULL,
	"food" varchar(255) NOT NULL,
	"walks" varchar(255) NOT NULL,
	"travel" varchar(255) NOT NULL,
	"hobbies" text[] DEFAULT '{}' NOT NULL,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "user_bio_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"profilePic" varchar(255),
	"user_id" uuid NOT NULL,
	CONSTRAINT "user_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DROP TABLE "user_about_self_hobbies" CASCADE;--> statement-breakpoint
DROP TABLE "user_looking_for_hobbies" CASCADE;--> statement-breakpoint
DROP TABLE "user_about_self_interests" CASCADE;--> statement-breakpoint
DROP TABLE "user_looking_for_interests" CASCADE;--> statement-breakpoint
DROP TABLE "user_looking_for_general" CASCADE;--> statement-breakpoint
DROP TABLE "users_about_self" CASCADE;--> statement-breakpoint
ALTER TABLE "user_bio" ADD CONSTRAINT "user_bio_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "finishedSelfSetup";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "finishedLookingForSetup";