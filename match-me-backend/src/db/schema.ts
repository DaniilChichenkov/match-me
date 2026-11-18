import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  check,
  uniqueIndex,
  index,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const userProfile = pgTable("user_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  profilePic: varchar("profilePic", { length: 255 }),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const userBio = pgTable("user_bio", {
  id: uuid("id").primaryKey().defaultRandom(),
  music: varchar("music", { length: 255 }).notNull(),
  food: varchar("food", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  walks: varchar("walks", { length: 255 }).notNull(),
  travel: varchar("travel", { length: 255 }).notNull(),
  hobbies: text("hobbies").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const connections = pgTable(
  "connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: varchar("status", { length: 255 }).notNull().default("pending"),
    senderId: uuid("senderId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: uuid("receiverId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastMessageTimestamp: timestamp("last_message_time"),
  },
  (table) => [
    check(
      "connections_different_users",
      sql`${table.senderId} <> ${table.receiverId}`,
    ),

    uniqueIndex("connections_unique_pair").on(
      sql`LEAST(${table.senderId}, ${table.receiverId})`,
      sql`GREATEST(${table.senderId}, ${table.receiverId})`,
    ),

    index("connections_sender_idx").on(table.senderId),
    index("connections_receiver_idx").on(table.receiverId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    connectionId: uuid("connection_id")
      .notNull()
      .references(() => connections.id, {
        onDelete: "cascade",
      }),

    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    content: text("content").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    readAt: timestamp("read_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("messages_connection_date_idx").on(
      table.connectionId,
      table.createdAt,
      table.id,
    ),
  ],
);

export const messagesNotifications = pgTable(
  "messages_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageFrom: uuid("senderId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    messageTo: uuid("recipientId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    connectionId: uuid("connection_id")
      .notNull()
      .references(() => connections.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("message_notifications_recipient_connection_idx").on(
      table.messageTo,
      table.connectionId,
    ),
  ],
);
