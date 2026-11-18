CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accepted" boolean DEFAULT false,
	"senderId" uuid NOT NULL,
	"receiverId" uuid NOT NULL,
	CONSTRAINT "connections_different_users" CHECK ("connections"."senderId" <> "connections"."receiverId")
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_receiverId_users_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "connections_unique_pair" ON "connections" USING btree (LEAST("senderId", "receiverId"),GREATEST("senderId", "receiverId"));--> statement-breakpoint
CREATE INDEX "connections_sender_idx" ON "connections" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "connections_receiver_idx" ON "connections" USING btree ("receiverId");