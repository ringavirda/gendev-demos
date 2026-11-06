import { ZodError } from "zod";

/** A store that cannot be read or holds data the model refuses. */
export class StorageError extends Error {
  override name = "StorageError";

  /**
   * @param path file the data came from, or `:memory:`.
   * @param detail what is wrong with it.
   */
  constructor(path: string, detail: string) {
    super(`Cannot read ${path}: ${detail}`);
  }
}

/**
 * @param error a failure while reading stored data.
 * @returns the first schema issue as `<path>: <message>` (just `<message>` at the root) for a `ZodError`, otherwise the error's message.
 */
export function describeFailure(error: unknown): string {
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const where = issue.path.join(".");
    return where ? `${where}: ${issue.message}` : issue.message;
  }
  return error instanceof Error ? error.message : String(error);
}
