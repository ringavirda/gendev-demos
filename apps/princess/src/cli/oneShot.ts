import type { CommandStatus, Executor } from "@gendev/cli-lib";

/** Process exit code: 0 done, 1 the command failed, 2 the command was used wrongly. */
export type ExitCode = 0 | 1 | 2;

/**
 * @param status the result of running a command line.
 * @returns 0 for `ok` and `empty`, 1 for `failed`, 2 for `unknown` and `usage`.
 */
export function exitCode(status: CommandStatus): ExitCode {
  switch (status) {
    case "ok":
    case "empty":
      return 0;
    case "failed":
      return 1;
    case "unknown":
    case "usage":
      return 2;
  }
}

/**
 * Runs the words as one command line.
 * @param executor runs the line.
 * @param words the command and its arguments, as given on the command line.
 * @returns the exit code for the result.
 */
export async function runOnce(
  executor: Executor,
  words: readonly string[],
): Promise<ExitCode> {
  return exitCode(await executor.execute(words.join(" ")));
}
