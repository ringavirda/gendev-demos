import "reflect-metadata";
import { container, singleton } from "tsyringe";

import { CLI, Executor } from "@cli/lib";
import { PrincessCommands } from "./services/commands";
import { PrincessesRepository } from "./services/repository";

@singleton()
class App {
  constructor(
    private readonly _cli: CLI,
    private readonly _exec: Executor,
    private readonly _commands: PrincessCommands,
    private readonly _entity: PrincessesRepository,
  ) {
    this._exec.registerCommand(
      {
        selectors: ["exit", "quit", "q"],
        description: "Exits the application.",
        actionAsync: async () => {
          this.echoLines(this._goodbyLines);
          this._cli.close();
          process.exit(0);
        },
      },
      true,
    );
    this._commands.commandList.forEach((c) => this._exec.registerCommand(c));
  }

  private readonly _helloLines: Array<string> = [
    "Princess selector CLI!",
    "Use (help) to see command list, or (q) to exit.",
  ];
  private readonly _goodbyLines: Array<string> = [
    "Fallenstar is always watching...",
  ];
  private readonly _promptSymbol: string = "->";

  public async startupAsync(): Promise<void> {
    await this._entity.loadAsync();
  }

  public async runAsync() {
    this.echoLines(this._helloLines);
    while (true) {
      const command = await this._cli.readCommandAsync(this._promptSymbol);
      await this._exec.executeAsync(command);
    }
  }

  private echoLines(lines: Array<string>): void {
    lines.forEach((l) => this._cli.echoTitle(l));
  }
}

// Startup and run

const app = container.resolve(App);

await app.startupAsync();
await app.runAsync();
