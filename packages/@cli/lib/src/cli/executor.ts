import { singleton } from "tsyringe";

import { Command } from "../models/command.js";
import { CLI } from "./cli.js";
import { CArgs } from "../models/cArgs.js";

@singleton()
export class Executor {
  private _commands: Array<Command> = [];

  constructor(private readonly _cli: CLI) {
    this.registerCommand(
      {
        selectors: ["help", "h"],
        actionAsync: async () => {
          this._cli.echoSuccess("Supported command signatures:");
          this._commands
            .map((c) => c.selectors.join(", "))
            .forEach((s) => this._cli.echo(` - ${s}`));
        },
      },
      true,
    );
  }

  public async executeAsync(cArgs: CArgs): Promise<void> {
    const command = this._commands.find((c) =>
      c.selectors.includes(cArgs.selector),
    );
    if (command === undefined)
      throw new Error(`Unknown command: ${cArgs.selector}`);

    await command.actionAsync(cArgs);
  }

  public registerCommand(command: Command, override: boolean = false): void {
    const existing = this._commands.find((c) =>
      c.selectors.some((s) => command.selectors.includes(s)),
    );
    if (existing !== undefined && !override) {
      throw new Error(
        `Command with selectors (${existing.selectors.join(
          ", ",
        )}) already exists! Use override flag to replace it.`,
      );
    }
    this._commands.push(command);
  }

  public unregisterCommand(selector: string): void {
    const index = this._commands.findIndex((c) =>
      c.selectors.includes(selector),
    );
    if (index === -1)
      throw new Error(`Cannot find command with selector: ${selector}`);
    this._commands.splice(index, 1);
  }

  public argsHaveLength(cArgs: CArgs, length: number): void {
    if (cArgs.args.length < length)
      throw new Error(
        `Command (${cArgs.selector}) requires at least ${length} argument(s).`,
      );
  }
}
