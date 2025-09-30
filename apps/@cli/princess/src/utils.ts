import { singleton } from "tsyringe";

import { CLI } from "@cli/lib";
import { Princess, PrincessMap } from "./models";

@singleton()
export class PrincessUtils {
  constructor(private readonly _cli: CLI) {}

  public readonly KnownPrincesses: PrincessMap = new Map([
    [
      "elder",
      [
        {
          commonName: "Celestia",
          oldName: "Celestia",
          titles: ["Princess of the Day", "Daybreaker"],
        },
        {
          commonName: "Luna",
          oldName: "Luna",
          titles: ["Princess of the Night", "Nightmare Moon"],
        },
        {
          commonName: "Cadance",
          oldName: "Mi Amore Cadenza",
          titles: ["Princess of Love", "Crystal Empress"],
        },
      ],
    ],
    [
      "young",
      [
        {
          commonName: "Sparkle",
          oldName: "Twilight Sparkle",
          titles: ["Princess of Friendship", "Element of Magic"],
        },
        {
          commonName: "Sunset",
          oldName: "Shimmer Sunset",
          titles: ["Demoness of Fire", "Element of Empathy"],
        },
        {
          commonName: "Fallenstar",
          oldName: "Starfall Fading",
          titles: ["Princess of Destruction", "Godhunter"],
        },
      ],
    ],
  ]);

  public echoPrincess(pr: Princess) {
    this._cli.echo(
      pr.commonName !== pr.oldName
        ? `${pr.commonName} (${pr.oldName}):`
        : `${pr.commonName}:`,
    );
    this._cli.echo(`\t${pr.titles.join(", ")}`);
  }

  public async princessDialogueAsync(commonName: string): Promise<Princess> {
    if (commonName === "") {
      this._cli.echoWarn("Please provide necessary information:");
      commonName = await this._cli.readAsync("Common Name:");
      if (commonName == "")
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
      commonName: commonName,
      oldName: oldName,
      titles: titles,
    };
  }
}
