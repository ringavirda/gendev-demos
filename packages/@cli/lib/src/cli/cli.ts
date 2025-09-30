import chalk from "chalk";
import { Interface, createInterface } from "readline/promises";
import { singleton } from "tsyringe";

import { CArgs } from "../models/cArgs.js";

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
  }

  public close(): void {
    this._cli.close();
  }

  public async readAsync(prompt: string): Promise<string> {
    return await this._cli.question(`${prompt} `);
  }

  public async readCommandAsync(prompt: string): Promise<CArgs> {
    const argsRaw = await this.readAsync(prompt);
    const args = argsRaw
      .split(" ")
      .map((s) => s.trim())
      .filter((s) => s != "");

    if (args.length === 0) throw new Error("Nothing was provided!");
    return {
      raw: args,
      selector: args[0],
      args: args.slice(1),
    };
  }

  public echoInline(message: string): void {
    this._cli.write(message);
  }
  public echo(message: string): void {
    this.echoInline(message);
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
