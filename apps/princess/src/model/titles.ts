/** The aliases of a princess: trimmed, non-empty, immutable. */
export class Titles implements Iterable<string> {
  static readonly empty = new Titles([]);

  readonly list: readonly string[];

  private constructor(list: readonly string[]) {
    this.list = Object.freeze([...list]);
    Object.freeze(this);
  }

  /**
   * @param text titles separated by commas; spaces inside a title are kept.
   * @returns the titles; empty entries are dropped.
   */
  static parse(text: string): Titles {
    return Titles.of(text.split(","));
  }

  /**
   * @param list titles to clean.
   * @returns the titles, each trimmed; empty entries are dropped.
   */
  static of(list: readonly string[]): Titles {
    return new Titles(list.map((title) => title.trim()).filter(Boolean));
  }

  get size(): number {
    return this.list.length;
  }

  [Symbol.iterator](): Iterator<string> {
    return this.list[Symbol.iterator]();
  }

  toString(): string {
    return this.list.join(", ");
  }
}
