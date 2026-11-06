import type { Category } from "../model/category.js";

/** Where the categories live. Methods other than `load` may be called only after it resolves. */
export interface PrincessRepository {
  /**
   * Opens, creates or seeds the store. Called once, before anything else.
   * @throws when the store cannot be read.
   */
  load(): Promise<void>;
  /** @returns the category names, in order. */
  categoryNames(): Promise<readonly string[]>;
  /**
   * @param name a category name or a prefix of one, matched without case.
   * @returns a new category on every call; changing it does not change the store.
   * @throws {NotFoundError} when no category matches.
   */
  get(name: string): Promise<Category>;
  /**
   * Replaces the stored category of the same name with this one.
   * @param category the category to store.
   * @throws when the store cannot be written; the category is then unchanged.
   */
  save(category: Category): Promise<void>;
}

/** Injection token for `PrincessRepository`. */
export const REPOSITORY = Symbol("PrincessRepository");

/** Severity of a log message, from least to most severe. */
export type LogLevel = "debug" | "info" | "warn" | "error";

/** Writes one message at each severity. */
export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/** Injection token for `Logger`. */
export const LOGGER = Symbol("Logger");

/**
 * @param max a positive integer
 * @returns an integer in `[0, max)`.
 */
export type Random = (max: number) => number;

/** Injection token for `Random`. */
export const RANDOM = Symbol("Random");

/** Token for `EventBus<PrincessEvent>`; the type argument does not exist at runtime. */
export const EVENT_BUS = Symbol("EventBus");
