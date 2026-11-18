CREATE TABLE "user_about_self_hobbies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"hobbie" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_about_self_interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"interest" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_about_self" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"favouriteMusic" varchar(255) NOT NULL,
	"favouriteFood" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"enjoyInterPlanetaryTravel" varchar(255) NOT NULL,
	"enjoyLongWalks" varchar(255) NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	CONSTRAINT "users_about_self_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_about_self_hobbies" ADD CONSTRAINT "user_about_self_hobbies_user_profile_id_users_about_self_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."users_about_self"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_about_self_interests" ADD CONSTRAINT "user_about_self_interests_user_profile_id_users_about_self_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."users_about_self"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_about_self" ADD CONSTRAINT "users_about_self_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;