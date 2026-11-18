CREATE TABLE "user_looking_for_hobbies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"hobby" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_looking_for_interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"interest" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_looking_for_general" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"favouriteMusic" varchar(255) NOT NULL,
	"favouriteFood" varchar(255) NOT NULL,
	"enjoyInterPlanetaryTravel" varchar(255) NOT NULL,
	"enjoyLongWalks" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_about_self_hobbies" RENAME COLUMN "hobbie" TO "hobby";--> statement-breakpoint
ALTER TABLE "user_looking_for_hobbies" ADD CONSTRAINT "user_looking_for_hobbies_user_profile_id_users_about_self_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."users_about_self"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_looking_for_interests" ADD CONSTRAINT "user_looking_for_interests_user_profile_id_users_about_self_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."users_about_self"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_looking_for_general" ADD CONSTRAINT "user_looking_for_general_user_profile_id_users_about_self_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."users_about_self"("id") ON DELETE cascade ON UPDATE no action;