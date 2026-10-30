import { inspect } from "node:util";

/** Base class of an example class. Examples print through `log` and `separator`. */
export abstract class ExamplesBase {
  /**
   * Prints a message with a vertical bar prefix on every line.
   * @param message A string is split on newlines; anything else is formatted
   * with `util.inspect` first.
   */
  protected log(message: unknown): void {
    const text = typeof message === "string" ? message : inspect(message);
    for (const line of text.split("\n")) console.log(` | ${line}`);
  }

  /** Prints a rule of 20 `=` characters behind the vertical bar prefix. */
  protected separator(): void {
    console.log(` | ${"=".repeat(20)}`);
  }
}

/** A class that `runExamples` can instantiate: no constructor arguments. */
export type ExampleClass = new () => ExamplesBase;

/** One runnable example of a class. */
export interface Example {
  /** Name of the method on the class prototype. */
  readonly key: string;
  /** Title printed before the example's output. */
  readonly title: string;
}
