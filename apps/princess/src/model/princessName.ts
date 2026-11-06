import { ValidationError } from "./errors.js";

/** The common name of a princess: trimmed, 1 to 40 characters, compared without case. */
export class PrincessName {
  static readonly maxLength = 40;

  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  /**
   * @param input name as typed; surrounding spaces are removed.
   * @returns the name.
   * @throws {ValidationError} when the trimmed name is empty or longer than 40 characters.
   */
  static parse(input: string): PrincessName {
    const value = input.trim();
    if (value.length === 0) {
      throw new ValidationError("A princess needs a name.");
    }
    if (value.length > PrincessName.maxLength) {
      throw new ValidationError(
        `Name [${input}] is longer than ${PrincessName.maxLength} characters.`,
      );
    }
    return new PrincessName(value);
  }

  /** True when both names are equal ignoring case. */
  equals(other: PrincessName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  /** True when the name starts with the trimmed prefix, ignoring case; false for a blank prefix. */
  matches(prefix: string): boolean {
    const typed = prefix.trim().toLowerCase();
    return typed.length > 0 && this.value.toLowerCase().startsWith(typed);
  }

  toString(): string {
    return this.value;
  }
}
