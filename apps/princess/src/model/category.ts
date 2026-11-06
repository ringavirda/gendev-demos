import { DuplicateError, NotFoundError } from "./errors.js";
import type { Princess } from "./princess.js";

const indexPattern = /^-?\d+$/;

/** A named, ordered list of princesses with no common name twice; may be empty. */
export class Category {
  private readonly items: Princess[] = [];

  /**
   * @param name category name.
   * @param princesses initial princesses, added in order.
   * @throws {DuplicateError} when two princesses share a common name.
   */
  constructor(
    readonly name: string,
    princesses: Iterable<Princess> = [],
  ) {
    for (const princess of princesses) {
      this.add(princess);
    }
  }

  get princesses(): readonly Princess[] {
    return this.items;
  }

  get size(): number {
    return this.items.length;
  }

  /**
   * @param nameOrIndex a zero-based index, or a name prefix matched without case.
   * @returns the princess; for a prefix, the first match in order.
   * @throws {NotFoundError} when the index is out of range or no name matches.
   */
  find(nameOrIndex: string): Princess {
    return this.items[this.indexOf(nameOrIndex)];
  }

  /**
   * @param princess the princess to append.
   * @throws {DuplicateError} when the common name is already present, ignoring case.
   */
  add(princess: Princess): void {
    if (
      this.items.some((item) => item.commonName.equals(princess.commonName))
    ) {
      throw new DuplicateError(
        `Princess [${princess.commonName}] already exists in [${this.name}].`,
      );
    }
    this.items.push(princess);
  }

  /**
   * @param nameOrIndex a zero-based index, or a name prefix matched without case.
   * @returns the removed princess.
   * @throws {NotFoundError} when the index is out of range or no name matches.
   */
  remove(nameOrIndex: string): Princess {
    return this.items.splice(this.indexOf(nameOrIndex), 1)[0];
  }

  /**
   * @param princess the new version; its common name picks the princess to replace.
   * @returns the previous version.
   * @throws {NotFoundError} when no princess has that common name.
   */
  replace(princess: Princess): Princess {
    const index = this.indexOf(princess.commonName.value);
    const previous = this.items[index];
    this.items[index] = princess;
    return previous;
  }

  private indexOf(nameOrIndex: string): number {
    if (indexPattern.test(nameOrIndex)) {
      const index = Number(nameOrIndex);
      if (index < 0 || index >= this.items.length) {
        throw new NotFoundError(
          `Id [${nameOrIndex}] is invalid for category [${this.name}].`,
        );
      }
      return index;
    }
    const index = this.items.findIndex((item) =>
      item.commonName.matches(nameOrIndex),
    );
    if (index < 0) {
      throw new NotFoundError(`Unknown princess [${nameOrIndex}].`);
    }
    return index;
  }
}

/**
 * @param names category names, in order.
 * @param typed a name prefix matched without case.
 * @returns the first name that starts with the prefix.
 * @throws {NotFoundError} when none matches or the prefix is blank.
 */
export function resolveCategoryName(
  names: readonly string[],
  typed: string,
): string {
  const prefix = typed.trim().toLowerCase();
  const found =
    prefix.length > 0
      ? names.find((name) => name.toLowerCase().startsWith(prefix))
      : undefined;
  if (found === undefined) {
    throw new NotFoundError(`Unknown category [${typed}].`);
  }
  return found;
}
