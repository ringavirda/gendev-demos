import { injectable } from "inversify";
import { CLI, type Command } from "@gendev/cli-lib";
import { describeEvent } from "../model/events.js";
import { PrincessService } from "../services/princessService.js";
import { History } from "../services/history.js";
import { askChanges, askNewPrincess, confirm } from "./dialogue.js";
import { formatPrincess } from "./format.js";

/** The commands of the princess app, printing through the CLI and calling the service. */
@injectable()
export class PrincessCommands {
  constructor(
    private readonly cli: CLI,
    private readonly service: PrincessService,
    private readonly history: History,
  ) {}

  /** @returns the commands in the order `help` shows them. */
  list(): Command[] {
    return [
      {
        selectors: ["list", "ls"],
        params: ["category?"],
        description: "Displays categories and princesses.",
        help: [
          "Prints out all known princess categories if no args are given. Displays all princesses inside a given category, if argument is specified.",
          "Supports shortened names.",
          "Syntax:",
          "  <selector> [category]",
          "Example usage:",
          "  ls",
          "  list young",
          "  ls e",
        ],
        action: async (category?: string) => {
          if (category === undefined) {
            this.cli.echoSuccess("Displaying available categories:");
            for (const name of await this.service.categoryNames()) {
              this.cli.echo(` - ${name}`);
            }
            return;
          }
          const found = await this.service.category(category);
          this.cli.echoSuccess(`Displaying category [${found.name}]:`);
          found.princesses.forEach((princess, index) => {
            const [name, titles] = formatPrincess(princess);
            this.cli.echo(`  ${index} - ${name}`);
            if (titles !== undefined) {
              this.cli.echo(titles);
            }
          });
        },
      },
      {
        selectors: ["get", "g"],
        params: ["category", "princess"],
        description: "Selects a princess for you.",
        help: [
          "Displays the selection message as well as some info about the princess.",
          "Supports shortened names and id positions.",
          "Syntax:",
          "  <selector> <category> <name|id>",
          "Example usage:",
          "  get young twilight",
          "  g e l",
          "  g y 2",
        ],
        action: async (category: string, princess: string) => {
          this.show(
            "Yay! You've selected: ",
            await this.service.select(category, princess),
          );
        },
      },
      {
        selectors: ["getrnd", "gr"],
        params: ["category?"],
        description: "Selects a random princess for you.",
        help: [
          "Displays the selection message as well as some info about the princess.",
          "Takes a category to pick from, or picks among all of them.",
          "Syntax:",
          "  <selector> [category]",
          "Example usage:",
          "  getrnd",
          "  gr young",
        ],
        action: async (category?: string) => {
          const princess = await this.service.pickRandom(category);
          this.cli.echoWarn("You prey to the RNG powers...");
          this.show("Someone suddenly appeared: ", princess);
        },
      },
      {
        selectors: ["add", "a"],
        params: ["category", "name"],
        description: "Appends given princess to category.",
        help: [
          "Using princess dialogue creates new princess model and adds it to the end of given category. Some information about the princess may be omitted.",
          "Syntax:",
          "  <selector> <category> <new_name>",
          "Example usage:",
          "  add young Moonlight",
          "  a e Ash",
        ],
        action: async (category: string, name: string) => {
          const target = await this.service.category(category);
          const princess = await askNewPrincess(this.cli, name);
          await this.service.add(target.name, princess);
          this.cli.echoSuccess(
            `Successfully added [${princess}] to category [${target.name}]`,
          );
        },
      },
      {
        selectors: ["remove", "rm"],
        params: ["category", "princess"],
        description: "Removes given princess from category.",
        help: [
          "Changes the storage state to remove the given princess. Supports both name and id selection.",
          "Prompts the user before executing the operation.",
          "Syntax:",
          "  <selector> <category> <name|id>",
          "Example usage:",
          "  remove elder Celestia",
          "  rm e cad",
          "  rm y 1",
        ],
        action: async (category: string, name: string) => {
          const target = await this.service.category(category);
          const princess = target.find(name);
          await confirm(this.cli, "remove", princess.commonName.value);
          await this.service.remove(target.name, name);
          this.cli.echoSuccess(
            `[${princess}] is removed from category [${target.name}]`,
          );
        },
      },
      {
        selectors: ["change", "ch"],
        params: ["category", "princess"],
        description: "Changes given princess to have other names.",
        help: [
          "Changes the storage state to modify the given princess in dialogue style. Some options may be omitted, uses old values in that case. Supports both name and id selection.",
          "Prompts the user before executing the operation.",
          "Syntax:",
          "  <selector> <category> <name|id>",
          "Example usage:",
          "  change young Fallenstar",
          "  ch e cel",
          "  ch y 0",
        ],
        action: async (category: string, name: string) => {
          const target = await this.service.category(category);
          const princess = target.find(name);
          const changes = await askChanges(this.cli);
          if (changes.oldName === undefined && changes.titles === undefined) {
            this.cli.echoWarn("No changes, skipping.");
            return;
          }
          await confirm(this.cli, "change", princess.commonName.value);
          const changed = await this.service.change(target.name, name, changes);
          this.cli.echoSuccess(`[${changed}] is changed to:`);
          formatPrincess(changed).forEach((line) => this.cli.echo(line));
        },
      },
      {
        selectors: ["history", "hi"],
        params: [],
        description: "Shows what changed in this session.",
        help: [
          "Prints one line per added, removed or changed princess since the app started.",
          "Syntax:",
          "  <selector>",
          "Example usage:",
          "  history",
          "  hi",
        ],
        action: () => {
          const events = this.history.events;
          if (events.length === 0) {
            this.cli.echo("No changes yet.");
          }
          events.forEach((event) => this.cli.echo(describeEvent(event)));
        },
      },
    ];
  }

  private show(prefix: string, princess: Parameters<typeof formatPrincess>[0]) {
    const [name, titles] = formatPrincess(princess);
    this.cli.echo(`${prefix}${name}`);
    if (titles !== undefined) {
      this.cli.echo(titles);
    }
  }
}
