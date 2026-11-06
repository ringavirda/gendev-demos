import { inject, injectable } from "inversify";
import { CLI, Executor } from "@gendev/cli-lib";
import type { PrincessEvent } from "../model/events.js";
import { runInteractive } from "../cli/interactive.js";
import { runOnce, type ExitCode } from "../cli/oneShot.js";
import { EventBus } from "../services/eventBus.js";
import { subscribeLogger } from "../services/listeners.js";
import {
  EVENT_BUS,
  LOGGER,
  REPOSITORY,
  type Logger,
  type PrincessRepository,
} from "../services/ports.js";
import { StorageError } from "../storage/storageError.js";

/** The whole program: loads the store, then runs one command line or the interactive loop. */
@injectable()
export class App {
  constructor(
    private readonly cli: CLI,
    private readonly executor: Executor,
    @inject(REPOSITORY) private readonly repository: PrincessRepository,
    @inject(EVENT_BUS) private readonly events: EventBus<PrincessEvent>,
    @inject(LOGGER) private readonly logger: Logger,
  ) {}

  /**
   * @param argv the words after the program name; empty starts the interactive loop.
   * @returns 0 when done, 1 when the store cannot be read or the command failed, 2 when the
   * command was used wrongly. Always 0 for the interactive loop.
   */
  async run(argv: readonly string[]): Promise<ExitCode> {
    subscribeLogger(this.events, this.logger);
    try {
      await this.repository.load();
    } catch (error) {
      if (error instanceof StorageError) {
        this.cli.echoError(error.message);
        this.cli.close();
        return 1;
      }
      throw error;
    }
    try {
      if (argv.length > 0) {
        return await runOnce(this.executor, argv);
      }
      await runInteractive(this.cli, this.executor);
      return 0;
    } finally {
      this.cli.close();
    }
  }
}
