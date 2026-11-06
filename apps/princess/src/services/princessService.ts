import { inject, injectable } from "inversify";
import { NotFoundError } from "../model/errors.js";
import type { Category } from "../model/category.js";
import { Princess, type PrincessChanges } from "../model/princess.js";
import type { PrincessEvent } from "../model/events.js";
import { EventBus } from "./eventBus.js";
import { logged, type HasLogger } from "./logged.js";
import {
  EVENT_BUS,
  LOGGER,
  RANDOM,
  REPOSITORY,
  type Logger,
  type PrincessRepository,
  type Random,
} from "./ports.js";

/**
 * The use cases of the app. Each loads a category, calls the model, saves, then publishes its
 * event; nothing is published when a step throws. Returns model objects and never prints.
 */
@injectable()
export class PrincessService implements HasLogger {
  constructor(
    @inject(REPOSITORY) private readonly repository: PrincessRepository,
    @inject(EVENT_BUS) private readonly events: EventBus<PrincessEvent>,
    @inject(LOGGER) readonly logger: Logger,
    @inject(RANDOM) private readonly random: Random,
  ) {}

  /** @returns the category names, in order. */
  @logged
  async categoryNames(): Promise<readonly string[]> {
    return this.repository.categoryNames();
  }

  /**
   * @param name a category name or a prefix of one.
   * @throws {NotFoundError} when no category matches.
   */
  @logged
  async category(name: string): Promise<Category> {
    return this.repository.get(name);
  }

  /**
   * @param category a category name or a prefix of one.
   * @param nameOrIndex a zero-based index, or a name prefix.
   * @throws {NotFoundError} when the category or the princess is not found.
   */
  @logged
  async select(category: string, nameOrIndex: string): Promise<Princess> {
    return (await this.repository.get(category)).find(nameOrIndex);
  }

  /**
   * @param category a category name or prefix; every non-empty category when omitted.
   * @returns a random princess; every category and every princess can be drawn.
   * @throws {NotFoundError} when the named category is empty or has no match, or when no
   * category has a princess.
   */
  @logged
  async pickRandom(category?: string): Promise<Princess> {
    if (category !== undefined) {
      const named = await this.repository.get(category);
      if (named.size === 0) {
        throw new NotFoundError(`Category [${named.name}] is empty.`);
      }
      return named.princesses[this.random(named.size)];
    }
    const categories = await Promise.all(
      (await this.repository.categoryNames()).map((name) =>
        this.repository.get(name),
      ),
    );
    const filled = categories.filter((item) => item.size > 0);
    if (filled.length === 0) {
      throw new NotFoundError("No princesses to pick from.");
    }
    const chosen = filled[this.random(filled.length)];
    return chosen.princesses[this.random(chosen.size)];
  }

  /**
   * @throws {NotFoundError} when the category is not found.
   * @throws {DuplicateError} when the common name is already in the category.
   */
  @logged
  async add(category: string, princess: Princess): Promise<void> {
    const target = await this.repository.get(category);
    target.add(princess);
    await this.repository.save(target);
    this.events.publish({ type: "added", category: target.name, princess });
  }

  /**
   * @returns the removed princess.
   * @throws {NotFoundError} when the category or the princess is not found.
   */
  @logged
  async remove(category: string, nameOrIndex: string): Promise<Princess> {
    const target = await this.repository.get(category);
    const princess = target.remove(nameOrIndex);
    await this.repository.save(target);
    this.events.publish({ type: "removed", category: target.name, princess });
    return princess;
  }

  /**
   * @param changes fields to replace; fields not given are kept.
   * @returns the princess as changed.
   * @throws {NotFoundError} when the category or the princess is not found.
   */
  @logged
  async change(
    category: string,
    nameOrIndex: string,
    changes: PrincessChanges,
  ): Promise<Princess> {
    const target = await this.repository.get(category);
    const princess = target.find(nameOrIndex).with(changes);
    target.replace(princess);
    await this.repository.save(target);
    this.events.publish({ type: "changed", category: target.name, princess });
    return princess;
  }
}
