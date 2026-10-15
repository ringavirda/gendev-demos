import chalk from "chalk";
import { Interface, createInterface } from "readline/promises";
import { singleton } from "tsyringe";

import { EchoOptions } from "./models/echo.js";
import { CommandArgs } from "./models/command.js";

@singleton()
export class CLI {
  private readonly _cli: Interface;

  constructor() {
    this._cli = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    this._cli.setPrompt("");
    this._cli.on("SIGINT", () => {
      this.echo();
      this.echoError("[Ctrl+C] triggered, exiting...");
      this._cli.close();
      process.exit(0);
    });
    this._cli.on("close", () => {
      process.exit(0);
    });
  }

  public close(): void {
    this._cli.close();
  }

  public async readAsync(prompt: string): Promise<string> {
    return await this._cli.question(`${prompt} `);
  }

  public async readCommandAsync(prompt: string): Promise<CommandArgs> {
    const argsRaw = await this.readAsync(prompt);
    const args = argsRaw
      .split(" ")
      .map((s) => s.trim())
      .filter((s) => s != "");

    if (args.length === 0) throw new Error("Nothing was provided!");
    return {
      raw: args,
      selector: args[0],
      list: args.slice(1),
    };
  }

  public echoInline(message: string, options?: EchoOptions): void {
    let request = message;
    if (options?.color) request = chalk[options.color](request);
    if (options?.underline) request = chalk.underline(request);
    if (options?.bold) request = chalk.bold(request);
    this._cli.write(request);
  }

  public echo(message?: string, options?: EchoOptions): void {
    if (message) this.echoInline(message, options);
    this.echoInline("\n");
  }

  public echoSuccess(message: string): void {
    this.echo(chalk.green(message));
  }
  public echoWarn(message: string): void {
    this.echo(chalk.yellow(`${chalk.underline("Warn:")} ${message}`));
  }
  public echoError(message: string): void {
    this.echo(chalk.red(`${chalk.underline("Err:")} ${message}`));
  }
  public echoTitle(message: string): void {
    this.echo(chalk.bold.red(message));
  }
}
