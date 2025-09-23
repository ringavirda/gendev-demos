import process from "process";
import chalk from "chalk";
import * as readline from "readline/promises";

import { commandPump, DefaultCommandList } from "./commands.js";
import { princessRepo } from "./repository.js";

/**
 * Command line interface using class approach, since we use
 * this as a semi-service.
 */
class CLI {
  #cli = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  /**
   * Entry point with the main application loop.
   *
   * @param {object} startRequest an object with `hello`, `prompt` and `quit`
   * `string` fields, `pump` that specifies main command pump and `commands`
   * with additional commands.
   */
  async start(startRequest) {
    // Print hello message
    this.echo(chalk.bold.magenta(startRequest.hello));

    while (true) {
      // Ask the user
      const line = await this.#cli.question(`${startRequest.prompt} `);
      // Parse what he/she said
      const args = line
        .split(" ")
        .map((s) => s.trim())
        .filter((s) => s != "");

      if (args.length === 0) this.echoError("Nothing was provided!");
      else {
        // Extract the command selector
        const selector = args.splice(0, 1)[0];
        // Exit if end selector was provided
        if (startRequest.quit.includes(selector)) {
          this.#cli.close();
          return;
        }
        // Process the command
        startRequest.pump(
          selector,
          args,
          DefaultCommandList.concat(startRequest.commands),
        );
      }
    }
  }

  // All the echos are here, new and with colors!

  echoInline(message) {
    process.stdout.write(message);
  }
  echo(message) {
    this.echoInline(message);
    this.echoInline("\n");
  }
  echoSuccess(message) {
    this.echo(chalk.green(message));
  }
  echoWarn(message) {
    this.echo(chalk.yellow(`${chalk.underline("Warn:")} ${message}`));
  }
  echoError(message) {
    this.echo(chalk.red(`${chalk.underline("Err:")} ${message}`));
  }
}

// Export as semi-singleton.
export const cli = new CLI();

// Export main entry point.
export const startCli = async (startRequest) => {
  // Ensure that the request object is fully initialized.
  startRequest.hello ??=
    "Default Greeting Message.\nWrite (exit) to stop execution.";
  startRequest.prompt ??= ">";
  startRequest.quit ??= ["exit"];
  startRequest.pump ??= commandPump;
  startRequest.commands ??= [];

  await cli.start(startRequest);
  await princessRepo.save();
};
