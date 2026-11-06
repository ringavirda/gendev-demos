import { describeEvent, type PrincessEvent } from "../model/events.js";
import type { EventBus } from "./eventBus.js";
import type { Logger } from "./ports.js";

/**
 * Writes each event to the logger at info level.
 * @returns a function that stops it.
 */
export function subscribeLogger(
  events: EventBus<PrincessEvent>,
  logger: Logger,
): () => void {
  return events.subscribe((event) => logger.info(describeEvent(event)));
}
