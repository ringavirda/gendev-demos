import "reflect-metadata";
import { container, singleton } from "tsyringe";

import { CLI, Executor } from "@gendev/cli-lib";

@singleton()
class App {
  constructor(
    private readonly _cli: CLI,
    private readonly _executor: Executor,
  ) {
    this._executor.registerCommand(
      {
        selectors: ["quit", "q"],
        actionAsync: async () => {
          this._cli.echo("Exiting...");
          process.exit(0);
        },
      },
      true,
    );
  }

  public async run() {
    this._cli.echoSuccess("Demo CLI app is running...");
    while (true) {
      const command = await this._cli.readCommandAsync("> ");
      await this._executor.executeAsync(command);
    }
  }
}

container.resolve(App).run();
