import { Category, resolveCategoryName } from "../../src/model/category.js";
import { defaultCategories } from "../../src/model/defaults.js";
import type { Princess } from "../../src/model/princess.js";
import type { PrincessRepository } from "../../src/services/ports.js";

export class MemoryPrincessRepository implements PrincessRepository {
  /** Names of the saved categories, in save order. */
  readonly saved: string[] = [];
  failSaves = false;
  private readonly stored = new Map<string, Princess[]>();

  constructor(categories: Category[] = defaultCategories()) {
    for (const category of categories) {
      this.stored.set(category.name, [...category.princesses]);
    }
  }

  async load(): Promise<void> {}

  async categoryNames(): Promise<readonly string[]> {
    return [...this.stored.keys()];
  }

  async get(name: string): Promise<Category> {
    const resolved = resolveCategoryName([...this.stored.keys()], name);
    return new Category(resolved, this.stored.get(resolved));
  }

  async save(category: Category): Promise<void> {
    if (this.failSaves) {
      throw new Error("The save failed.");
    }
    this.stored.set(category.name, [...category.princesses]);
    this.saved.push(category.name);
  }
}
