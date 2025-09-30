import "reflect-metadata";
import { container, singleton } from "tsyringe";

import { CLI, Executor } from "@cli/lib";
import { PrincessCommands } from "./commands";
import { PrincessesEntity } from "./models";

@singleton()
class App {
  constructor(
    private readonly _cli: CLI,
    private readonly _exec: Executor,
    private readonly _commands: PrincessCommands,
    private readonly _entity: PrincessesEntity,
  ) {
    this._exec.registerCommand({
      selectors: ["exit", "quit", "q"],
      actionAsync: async () => {
        this.echoLines(this._goodbyLines);
        this._cli.close();
        process.exit(0);
      },
    });

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

  public async run() {
    this.echoLines(this._helloLines);
    while (true) {
      const command = await this._cli.readCommandAsync(this._promptSymbol);
      try {
        await this._exec.executeAsync(command);
      } catch (err) {
        this._cli.echoError((err as Error).message);
      }
    }
  }

  private echoLines(lines: Array<string>): void {
    lines.forEach((l) => this._cli.echoTitle(l));
  }
}

// Startup and run

const app = container.resolve(App);

await app.startupAsync();
await app.run();
