import type { CLI, Executor } from "@gendev/cli-lib";

const quitWords = ["exit", "quit", "q"];

/**
 * Reads and runs one command per line until the input ends or a quit word (`exit`, `quit`, `q`)
 * is typed, then prints the goodbye.
 * @param cli where the prompt and the output go.
 * @param executor runs each line.
 */
export async function runInteractive(
  cli: CLI,
  executor: Executor,
): Promise<void> {
  cli.echoTitle("Princess selector CLI!");
  cli.echoTitle("Use (help) to see command list, or (q) to exit.");
  for (;;) {
    const line = await cli.read("->");
    if (line === null || quitWords.includes(line.trim().toLowerCase())) {
      break;
    }
    await executor.execute(line);
  }
  cli.echoTitle("Fallenstar is always watching...");
}
