import Database from "better-sqlite3";
import { asc, eq, sql } from "drizzle-orm";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Category, resolveCategoryName } from "../model/category.js";
import { defaultCategories } from "../model/defaults.js";
import type { PrincessRepository } from "../services/ports.js";
import { toPrincess, toRows } from "./sqliteMapping.js";
import { categories, createStatements, princesses } from "./sqliteTables.js";
import { StorageError, describeFailure } from "./storageError.js";

const memory = ":memory:";

/** Keeps the categories in two SQLite tables, one row per princess. */
export class SqlitePrincessRepository implements PrincessRepository {
  private database: Database.Database | undefined;
  private db: BetterSQLite3Database | undefined;

  /**
   * @param path the database file, or `:memory:`; nothing is opened until `load`.
   * @param seed the categories stored when the tables are empty.
   */
  constructor(
    private readonly path: string,
    private readonly seed: () => Category[] = defaultCategories,
  ) {}

  /** @throws {StorageError} when the folder cannot be made or the file is not a database. */
  async load(): Promise<void> {
    try {
      if (this.path !== memory) {
        await mkdir(dirname(this.path), { recursive: true });
      }
      const database = new Database(this.path);
      try {
        const db = drizzle(database);
        for (const statement of createStatements) {
          db.run(sql.raw(statement));
        }
        if (db.select().from(categories).limit(1).all().length === 0) {
          db.transaction((tx) => {
            for (const category of this.seed()) {
              tx.insert(categories).values({ name: category.name }).run();
              this.insertRows(tx, category);
            }
          });
        }
        this.database = database;
        this.db = db;
      } catch (error) {
        database.close();
        throw error;
      }
    } catch (error) {
      throw new StorageError(this.path, describeFailure(error));
    }
  }

  async categoryNames(): Promise<readonly string[]> {
    return this.names(this.opened());
  }

  /** @throws {StorageError} when a stored princess is damaged. */
  async get(name: string): Promise<Category> {
    const db = this.opened();
    const resolved = resolveCategoryName(this.names(db), name);
    const rows = db
      .select()
      .from(princesses)
      .where(eq(princesses.category, resolved))
      .orderBy(asc(princesses.position))
      .all();
    try {
      return new Category(resolved, rows.map(toPrincess));
    } catch (error) {
      throw new StorageError(this.path, describeFailure(error));
    }
  }

  async save(category: Category): Promise<void> {
    const db = this.opened();
    db.transaction((tx) => {
      tx.insert(categories)
        .values({ name: category.name })
        .onConflictDoNothing()
        .run();
      tx.delete(princesses).where(eq(princesses.category, category.name)).run();
      this.insertRows(tx, category);
    });
  }

  private insertRows(
    tx: Pick<BetterSQLite3Database, "insert">,
    category: Category,
  ): void {
    const rows = toRows(category);
    if (rows.length > 0) {
      tx.insert(princesses).values(rows).run();
    }
  }

  private names(db: BetterSQLite3Database): string[] {
    return db
      .select()
      .from(categories)
      .orderBy(sql`rowid`)
      .all()
      .map((row) => row.name);
  }

  private opened(): BetterSQLite3Database {
    if (this.db === undefined || this.database === undefined) {
      throw new Error("load() was not called");
    }
    return this.db;
  }
}
