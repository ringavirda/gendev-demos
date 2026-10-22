import { join, resolve } from "node:path";
import { CLI } from "./cli.js";
import { createCommands } from "./commands.js";
import { Executor } from "./executor.js";
import { PrincessRepository } from "./repository.js";

const quit = ["exit", "quit", "q"];

const statePath = () =>
  process.env.SELECTOR_DATA
    ? resolve(process.env.SELECTOR_DATA)
    : join(import.meta.dirname, "../../data/selector.json");

/**
 * Runs the princess selector on the terminal until the input ends or a quit
 * word is entered. A state file that cannot be read is reported to stderr and
 * sets the exit code to 1.
 *
 * @returns {Promise<void>} resolves when the selector has finished.
 */
export const runSelector = async () => {
  const repository = new PrincessRepository(statePath());
  const cli = new CLI();
  const executor = new Executor(cli);
  for (const command of createCommands(repository, cli))
    executor.registerCommand(command);

  try {
    await repository.load();
  } catch (error) {
    cli.echoError(error.message);
    cli.close();
    process.exitCode = 1;
    return;
  }

  cli.echo("Princess selector CLI!");
  cli.echo("Use (help) to see command list, or (q) to exit.");
  while (true) {
    const line = await cli.read("->");
    if (line === null || quit.includes(line.trim())) break;
    await executor.execute(line);
  }
  cli.close();
};
