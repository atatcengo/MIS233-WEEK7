import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm';

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  status: text("status").default("todo"),
  priority: text("priority").default("medium"),
  module: text("module"),
  createdAt: integer("created_at").default(Math.floor(Date.now() / 1000)),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});