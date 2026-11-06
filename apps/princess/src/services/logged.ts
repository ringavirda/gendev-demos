import type { Logger } from "./ports.js";

export interface HasLogger {
  readonly logger: Logger;
}

/**
 * Method decorator for async methods of a class with a `logger`. Writes
 * `<key>(<arguments>) took <n> ms` at debug level, or `<key>(<arguments>) failed after <n> ms`
 * and rethrows; `<n>` is whole milliseconds.
 */
export function logged(
  target: HasLogger,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>,
): void {
  const original = descriptor.value!;
  descriptor.value = async function (this: HasLogger, ...args: any[]) {
    const call = `${key}(${args.map(String).join(", ")})`;
    const started = performance.now();
    const elapsed = () => Math.round(performance.now() - started);
    try {
      const result = await original.apply(this, args);
      this.logger.debug(`${call} took ${elapsed()} ms`);
      return result;
    } catch (error) {
      this.logger.debug(`${call} failed after ${elapsed()} ms`);
      throw error;
    }
  };
}
