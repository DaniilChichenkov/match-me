ALTER TABLE "user_looking_for_general" RENAME COLUMN "user_profile_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "user_looking_for_hobbies" DROP CONSTRAINT "user_looking_for_hobbies_user_profile_id_users_about_self_id_fk";
--> statement-breakpoint
ALTER TABLE "user_looking_for_interests" DROP CONSTRAINT "user_looking_for_interests_user_profile_id_users_about_self_id_fk";
--> statement-breakpoint
ALTER TABLE "user_looking_for_general" DROP CONSTRAINT "user_looking_for_general_user_profile_id_users_about_self_id_fk";
--> statement-breakpoint
ALTER TABLE "user_looking_for_hobbies" ADD CONSTRAINT "user_looking_for_hobbies_user_profile_id_user_looking_for_general_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_looking_for_general"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_looking_for_interests" ADD CONSTRAINT "user_looking_for_interests_user_profile_id_user_looking_for_general_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_looking_for_general"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_looking_for_general" ADD CONSTRAINT "user_looking_for_general_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_looking_for_general" ADD CONSTRAINT "user_looking_for_general_user_id_unique" UNIQUE("user_id");