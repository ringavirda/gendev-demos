import type { Princess } from "./princess.js";

export type PrincessEvent =
  | {
      readonly type: "added";
      readonly category: string;
      readonly princess: Princess;
    }
  | {
      readonly type: "removed";
      readonly category: string;
      readonly princess: Princess;
    }
  | {
      readonly type: "changed";
      readonly category: string;
      readonly princess: Princess;
    };

/** One line for the log: `added Moonlight to young`, `removed Sunset from young`, `changed Sparkle in young`. */
export function describeEvent(event: PrincessEvent): string {
  const { princess, category } = event;
  switch (event.type) {
    case "added":
      return `added ${princess} to ${category}`;
    case "removed":
      return `removed ${princess} from ${category}`;
    case "changed":
      return `changed ${princess} in ${category}`;
  }
}
