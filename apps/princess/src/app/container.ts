import { randomInt } from "node:crypto";
import { Container } from "inversify";
import { CLI, Executor } from "@gendev/cli-lib";
import type { PrincessEvent } from "../model/events.js";
import { PrincessCommands } from "../cli/commands.js";
import { createExecutor } from "../cli/executor.js";
import { EventBus } from "../services/eventBus.js";
import { History } from "../services/history.js";
import {
  EVENT_BUS,
  LOGGER,
  RANDOM,
  REPOSITORY,
  type PrincessRepository,
  type Random,
} from "../services/ports.js";
import { PrincessService } from "../services/princessService.js";
import { JsonPrincessRepository } from "../storage/jsonRepository.js";
import { SqlitePrincessRepository } from "../storage/sqliteRepository.js";
import { App } from "./app.js";
import { CONFIG, type Config } from "./config.js";
import { StderrLogger } from "./logger.js";

const repositories = {
  json: JsonPrincessRepository,
  sqlite: SqlitePrincessRepository,
} satisfies Record<Config["storage"], new (path: string) => PrincessRepository>;

/**
 * @param config chooses the repository and the log level.
 * @returns a container with every binding of the app; nothing is created until it is asked for.
 */
export function createContainer(config: Config): Container {
  const container = new Container();
  container.bind(CONFIG).toConstantValue(config);
  container.bind(LOGGER).toConstantValue(new StderrLogger(config.logLevel));
  container.bind<Random>(RANDOM).toConstantValue((max) => randomInt(max));
  container
    .bind(EVENT_BUS)
    .toResolvedValue(() => new EventBus<PrincessEvent>())
    .inSingletonScope();
  container
    .bind(REPOSITORY)
    .toResolvedValue(() => new repositories[config.storage](config.dataPath))
    .inSingletonScope();
  container.bind(PrincessService).toSelf().inSingletonScope();
  container.bind(History).toSelf().inSingletonScope();
  container.bind(PrincessCommands).toSelf().inSingletonScope();
  container.bind(App).toSelf().inSingletonScope();
  container
    .bind(CLI)
    .toResolvedValue(() => new CLI())
    .inSingletonScope();
  container
    .bind(Executor)
    .toResolvedValue(createExecutor, [CLI, LOGGER, PrincessCommands])
    .inSingletonScope();
  return container;
}

/**
 * @param container a container made by `createContainer`.
 * @returns the app with its dependencies injected.
 */
export function resolveApp(container: Container): App {
  return container.get(App);
}
