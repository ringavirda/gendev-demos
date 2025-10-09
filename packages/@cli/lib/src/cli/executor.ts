import { singleton } from "tsyringe";

import { Command, CommandArgs } from "./models/command.js";
import { CLI } from "./cli.js";

@singleton()
export class Executor {
  private _commands: Array<Command> = [];

  constructor(private readonly _cli: CLI) {
    this.registerCommand(
      {
        selectors: ["help", "h"],
        description: "Returns information about other commands.",
        help: [
          "Displays all known commands if no selector is provided or displays help message for a given command selector.",
          "Syntax",
          "  help <command_selector?>",
          "Example usage:",
          "  help",
          "  h help",
          "  h exit",
        ],
        actionAsync: async (args: CommandArgs) => {
          if (args.list.length === 0) {
            this._cli.echoSuccess("Supported command signatures:");
            this._commands
              .map((c) => [c.selectors.join(", "), c.description])
              .forEach((s) => {
                this._cli.echoInline(` - ${s[0]}`);
                this._cli.echo(s[1] ? ` - ${s[1]}` : "");
              });
          } else if (args.list.length === 1) {
            const command = this._commands.find((c) =>
              c.selectors.includes(args.list[0]),
            );
            if (command) {
              this._cli.echoSuccess(
                `${command.selectors[0].toUpperCase()} command:`,
              );
              this._cli.echo(
                command.help
                  ? command.help.join("\n")
                  : "No help message was found!",
              );
            } else throw new Error(`Unknown command: ${args.list[0]}`);
          }
        },
      },
      true,
    );
    this.registerCommand(
      {
        selectors: ["exit", "quit", "q"],
        description: "Exits the application.",
        actionAsync: async () => {
          this._cli.close();
          process.exit(0);
        },
      },
      true,
    );
  }

  public async executeAsync(args: CommandArgs): Promise<void> {
    try {
      const command = this._commands.find((c) =>
        c.selectors.includes(args.selector),
      );
      if (command === undefined)
        this._cli.echoError(`Unknown command: ${args.selector}`);
      else await command.actionAsync(args);
    } catch (err) {
      this._cli.echoError((err as Error).message);
    }
  }

  public registerCommand(command: Command, override: boolean = false): void {
    const existing = this._commands.find((c) =>
      c.selectors.some((s) => command.selectors.includes(s)),
    );
    if (existing !== undefined) {
      if (override) {
        const position = this._commands.indexOf(existing);
        this._commands.splice(position, 1);
        this._commands.splice(position, 0, command);
        return;
      }
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
}
