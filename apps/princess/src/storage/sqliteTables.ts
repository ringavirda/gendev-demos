import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  name: text("name").primaryKey(),
});

export const princesses = sqliteTable("princesses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category")
    .notNull()
    .references(() => categories.name),
  position: integer("position").notNull(),
  commonName: text("common_name").notNull(),
  oldName: text("old_name"),
  titles: text("titles").notNull(),
});

export type PrincessRow = typeof princesses.$inferSelect;
export type NewPrincessRow = typeof princesses.$inferInsert;

export const createStatements = [
  "CREATE TABLE IF NOT EXISTS categories (name TEXT PRIMARY KEY)",
  `CREATE TABLE IF NOT EXISTS princesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL REFERENCES categories (name),
    position INTEGER NOT NULL,
    common_name TEXT NOT NULL,
    old_name TEXT,
    titles TEXT NOT NULL
  )`,
];
