import { inject, injectable } from "inversify";
import type { PrincessEvent } from "../model/events.js";
import { EventBus } from "./eventBus.js";
import { EVENT_BUS } from "./ports.js";

/** The events published since the app started. */
@injectable()
export class History {
  private readonly items: PrincessEvent[] = [];

  constructor(@inject(EVENT_BUS) events: EventBus<PrincessEvent>) {
    events.subscribe((event) => this.items.push(event));
  }

  /** The events in publication order. */
  get events(): readonly PrincessEvent[] {
    return this.items;
  }
}
