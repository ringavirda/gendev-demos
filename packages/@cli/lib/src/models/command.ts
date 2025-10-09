import { CArgs } from "./cArgs.js";

export type Command = {
  selectors: Array<string>;
  actionAsync: (args: CArgs) => Promise<void>;
};
