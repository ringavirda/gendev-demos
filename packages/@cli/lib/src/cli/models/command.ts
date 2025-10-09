export type Command = {
  selectors: Array<string>;
  description?: string;
  help?: string[];
  actionAsync: (args: CommandArgs) => Promise<void>;
};

export type CommandArgs = {
  raw: Array<string>;
  // Most commands use this convention.
  selector: string;
  list: Array<string>;

  // Options may be added here.
};
