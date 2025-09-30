import { CArgs } from "./cArgs.js";

export interface Command {
  selectors: Array<string>;
  actionAsync: (args: CArgs) => Promise<void>;
}
