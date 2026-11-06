import { checkArguments, type CLI, Executor } from "@gendev/cli-lib";
import type { Logger } from "../services/ports.js";
import type { PrincessCommands } from "./commands.js";
import { mapErrors, timing } from "./middleware.js";

/**
 * @param cli where output and errors go.
 * @param logger where timings and unexpected errors go.
 * @param commands the commands to register.
 * @returns an executor whose pipeline is `mapErrors`, `timing`, `checkArguments`, then the
 * command.
 */
export function createExecutor(
  cli: CLI,
  logger: Logger,
  commands: PrincessCommands,
): Executor {
  const executor = new Executor(cli);
  executor.use(mapErrors(cli, logger));
  executor.use(timing(logger));
  executor.use(checkArguments);
  for (const command of commands.list()) {
    executor.registerCommand(command);
  }
  return executor;
}
