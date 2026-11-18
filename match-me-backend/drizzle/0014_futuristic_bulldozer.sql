CREATE TABLE "messages_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senderId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages_notifications" ADD CONSTRAINT "messages_notifications_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;