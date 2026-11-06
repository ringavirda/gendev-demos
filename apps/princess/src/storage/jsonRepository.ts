import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Category, resolveCategoryName } from "../model/category.js";
import { defaultCategories } from "../model/defaults.js";
import type { PrincessRepository } from "../services/ports.js";
import {
  PrincessFileSchema,
  toCategories,
  toFile,
  type PrincessFile,
} from "./jsonFile.js";
import { StorageError, describeFailure } from "./storageError.js";

/** Keeps the categories in one JSON file, rewritten whole on every save. */
export class JsonPrincessRepository implements PrincessRepository {
  private file: PrincessFile | undefined;

  /**
   * @param path the JSON file; its folder is created on `load`.
   * @param seed the categories written when the file does not exist.
   */
  constructor(
    private readonly path: string,
    private readonly seed: () => Category[] = defaultCategories,
  ) {}

  /** @throws {StorageError} when the file cannot be read, is not JSON, fails the schema or breaks a model rule. */
  async load(): Promise<void> {
    try {
      await mkdir(dirname(this.path), { recursive: true });
      const text = await this.read();
      if (text === undefined) {
        this.file = toFile(this.seed());
        await this.write(this.file);
        return;
      }
      const file = PrincessFileSchema.parse(JSON.parse(text));
      toCategories(file);
      this.file = file;
    } catch (error) {
      throw new StorageError(this.path, describeFailure(error));
    }
  }

  async categoryNames(): Promise<readonly string[]> {
    return Object.keys(this.loaded().categories);
  }

  async get(name: string): Promise<Category> {
    const file = this.loaded();
    const resolved = resolveCategoryName(Object.keys(file.categories), name);
    return toCategories({
      categories: { [resolved]: file.categories[resolved] },
    })[0];
  }

  async save(category: Category): Promise<void> {
    const file = this.loaded();
    const next = toFile([category]);
    const updated: PrincessFile = {
      categories: { ...file.categories, ...next.categories },
    };
    await this.write(updated);
    this.file = updated;
  }

  private loaded(): PrincessFile {
    if (this.file === undefined) {
      throw new Error("load() was not called");
    }
    return this.file;
  }

  private async read(): Promise<string | undefined> {
    try {
      return await readFile(this.path, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  private async write(file: PrincessFile): Promise<void> {
    await writeFile(this.path, `${JSON.stringify(file, null, 2)}\n`);
  }
}
