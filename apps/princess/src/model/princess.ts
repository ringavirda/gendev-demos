import { PrincessName } from "./princessName.js";
import { Titles } from "./titles.js";

export interface PrincessFields {
  commonName: string; // Pony notation
  oldName?: string; // Unicorn notation
  titles?: readonly string[]; // Aliases
}

export interface PrincessChanges {
  oldName?: string;
  titles?: readonly string[];
}

/** A princess, identified by her common name. Immutable. */
export class Princess {
  private constructor(
    readonly commonName: PrincessName,
    readonly oldName: string | undefined,
    readonly titles: Titles,
  ) {
    Object.freeze(this);
  }

  /**
   * @param fields the princess; a blank old name means none.
   * @returns the princess.
   * @throws {ValidationError} when the common name is blank or longer than 40 characters.
   */
  static of(fields: PrincessFields): Princess {
    const oldName = fields.oldName?.trim();
    return new Princess(
      PrincessName.parse(fields.commonName),
      oldName || undefined,
      Titles.of(fields.titles ?? []),
    );
  }

  /** The old name, or the common name when there is none. */
  get fullName(): string {
    return this.oldName ?? this.commonName.value;
  }

  /**
   * @param changes fields to replace; fields not given are kept.
   * @returns a new princess; this one is unchanged.
   */
  with(changes: PrincessChanges): Princess {
    return Princess.of({
      commonName: this.commonName.value,
      oldName: changes.oldName ?? this.oldName,
      titles: changes.titles ?? this.titles.list,
    });
  }

  toString(): string {
    return this.commonName.value;
  }
}
