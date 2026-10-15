import { singleton } from "tsyringe";

import { CLI } from "@gendev/cli-lib";
import { Princess } from "./models/princess.js";

@singleton()
export class PrincessUtils {
  constructor(private readonly _cli: CLI) {}

  public echoPrincess(pr: Princess) {
    this._cli.echo(
      pr.commonName !== pr.oldName
        ? `${pr.commonName} (${pr.oldName})`
        : `${pr.commonName}`,
      { color: "magenta" },
    );
    this._cli.echo(`\t${pr.titles.join(", ")}`);
  }

  public async princessDialogueAsync(name: string): Promise<Princess> {
    if (name === "") {
      this._cli.echoWarn("Please provide necessary information:");
      name = await this._cli.readAsync("Common Name:");
      if (name == "")
        throw new Error("Cannot create new princess without a name.");
    } else this._cli.echoWarn("Please provide additional information:");

    const oldName = await this._cli.readAsync("Old Name (optional):");

    const titlesRaw = await this._cli.readAsync(
      "Titles (optional, comma separated):",
    );
    const titles = titlesRaw
      .replace(" ", "")
      .split(",")
      .filter((s) => s != "");

    return {
      commonName: name,
      oldName: oldName,
      titles: titles,
    };
  }

  public async princessConfirmAsync(
    operation: string,
    name: string,
  ): Promise<void> {
    this._cli.echoWarn(
      `You are about to ${operation} the princess ${name}, do you confirm?`,
    );
    const resp = await this._cli.readAsync("(yes/any) >");
    if (resp.toLowerCase() !== "yes") throw new Error("Operation aborted.");
  }
}
