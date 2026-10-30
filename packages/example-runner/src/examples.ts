import "reflect-metadata";
import chalk from "chalk";

import type { Example, ExampleClass, ExamplesBase } from "./types.js";

const EXAMPLES = Symbol("examples");
const TITLE = Symbol("title");

const PREFIX = "example";

function titleOf(key: string): string {
  const words = key
    .slice(PREFIX.length)
    .replace(/[A-Z]/g, (letter) => ` ${letter}`)
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Class decorator: stores the class's examples, in declaration order. An
 * example is an own method whose name starts with `example` or that carries
 * the `example` mark. Its title is the mark's title, else the name without the
 * prefix as a sentence (`exampleAsConst` becomes `As const`).
 * @returns A decorator to apply to a class extending `ExamplesBase`.
 */
export function registerExamples(): (
  target: abstract new () => ExamplesBase,
) => void {
  return (target) => {
    const examples: Example[] = [];
    for (const key of Reflect.ownKeys(target.prototype)) {
      if (typeof key !== "string" || key === "constructor") continue;
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
      if (typeof descriptor?.value !== "function") continue;
      const mark: string | undefined = Reflect.getOwnMetadata(
        TITLE,
        target.prototype,
        key,
      );
      if (mark === undefined && !key.startsWith(PREFIX)) continue;
      examples.push({ key, title: mark ?? titleOf(key) });
    }
    Reflect.defineMetadata(EXAMPLES, examples, target);
  };
}

/**
 * Method decorator: marks a method as an example under a title, whatever its
 * name. Applies only to classes decorated with `registerExamples`.
 * @param title Title printed before the example's output.
 * @returns A legacy method decorator.
 */
export function example(
  title: string,
): (target: ExamplesBase, key: string, descriptor: PropertyDescriptor) => void {
  return (target, key) => {
    Reflect.defineMetadata(TITLE, title, target, key);
  };
}

/**
 * Reads the examples stored by `registerExamples`.
 * @param target A class extending `ExamplesBase`.
 * @returns The examples in declaration order, or an empty array when the class
 * was never registered.
 */
export function getExamples(
  target: abstract new () => ExamplesBase,
): readonly Example[] {
  return Reflect.getOwnMetadata(EXAMPLES, target) ?? [];
}

/**
 * Runs every example of every class, one instance per class, and prints a
 * header per class and a title per example. An example that throws is reported
 * and the next one runs.
 * @param classes Classes decorated with `registerExamples`.
 * @returns `true` when no example threw.
 */
export function runExamples(classes: readonly ExampleClass[]): boolean {
  let ok = true;
  classes.forEach((cls, index) => {
    const examples = getExamples(cls);
    if (index > 0) console.log("");
    if (examples.length === 0) {
      console.log(chalk.yellow(`${cls.name}: no examples`));
      return;
    }
    const count = `${examples.length} ${examples.length === 1 ? "example" : "examples"}`;
    console.log(chalk.green(`${cls.name}: ${count}`));
    const instance = new cls();
    for (const { key, title } of examples) {
      console.log("");
      console.log(chalk.bold(title));
      try {
        (instance as unknown as Record<string, () => void>)[key]();
      } catch (error) {
        ok = false;
        console.log(chalk.red(` ! ${String(error)}`));
      }
    }
  });
  return ok;
}
