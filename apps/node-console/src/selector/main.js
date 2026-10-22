import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLI } from "./cli.js";
import { createCommands } from "./commands.js";
import { Executor } from "./executor.js";
import { PrincessRepository } from "./repository.js";

const quit = ["exit", "quit", "q"];

const statePath = () =>
  process.env.SELECTOR_DATA
    ? resolve(process.env.SELECTOR_DATA)
    : fileURLToPath(new URL("../../data/selector.json", import.meta.url));

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
  for (
    let line = await cli.read("->");
    line !== null;
    line = await cli.read("->")
  ) {
    if (quit.includes(line.trim())) break;
    await executor.execute(line);
  }
  cli.close();
};
