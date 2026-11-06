import "reflect-metadata";
import { PassThrough, Readable } from "node:stream";
import { stripVTControlCharacters } from "node:util";
import { CLI, type Executor } from "@gendev/cli-lib";
import type { PrincessEvent } from "../../src/model/events.js";
import { PrincessCommands } from "../../src/cli/commands.js";
import { createExecutor } from "../../src/cli/executor.js";
import { EventBus } from "../../src/services/eventBus.js";
import { History } from "../../src/services/history.js";
import { PrincessService } from "../../src/services/princessService.js";
import { MemoryPrincessRepository } from "../fakes/memoryRepository.js";
import { RecordingLogger } from "../fakes/recordingLogger.js";

export function createHarness(
  input: string[] = [],
  repository = new MemoryPrincessRepository(),
) {
  const out = new PassThrough();
  const err = new PassThrough();
  const cli = new CLI(Readable.from(input), out, err);
  const bus = new EventBus<PrincessEvent>();
  const logger = new RecordingLogger();
  const history = new History(bus);
  const service = new PrincessService(repository, bus, logger, () => 0);
  const executor: Executor = createExecutor(
    cli,
    logger,
    new PrincessCommands(cli, service, history),
  );
  let printed = "";
  let failed = "";
  const lines = (text: string) =>
    stripVTControlCharacters(text).split("\n").slice(0, -1);
  return {
    cli,
    executor,
    service,
    history,
    logger,
    repository,
    stdout(): string[] {
      printed += out.read()?.toString() ?? "";
      return lines(printed);
    },
    stderr(): string[] {
      failed += err.read()?.toString() ?? "";
      return lines(failed);
    },
  };
}
