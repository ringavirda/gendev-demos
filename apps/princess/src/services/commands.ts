import { singleton } from "tsyringe";
import { randomInt } from "node:crypto";

import { CLI, Command, CommandArgs } from "@gendev/cli-lib";
import { PrincessesRepository } from "./repository.js";
import { PrincessUtils } from "../utils.js";

@singleton()
export class PrincessCommands {
  constructor(
    private readonly _cli: CLI,
    private readonly _repo: PrincessesRepository,
    private readonly _utils: PrincessUtils,
  ) {}

  public readonly commandList: Array<Command> = [
    {
      selectors: ["list", "ls"],
      description: "Displays categories and princesses.",
      help: [
        "Prints out all known princess categories if no args are given. Displays all princesses inside a given category, if argument is specified.",
        "Supports shortened names.",
        "Syntax:",
        "  <selector> [category_arg?]",
        "Example usage:",
        "  ls",
        "  list young",
        "  ls e",
      ],
      actionAsync: async (args: CommandArgs) => {
        const categories = this._repo.getCategoryNames();
        const category = args.list[0] ?? "";
        if (category === "") {
          this._cli.echoSuccess("Displaying available categories:");
          categories.forEach((cat) => this._cli.echo(` - ${cat}`));
        } else {
          const category = this._repo.getCategory(args.list[0]);
          const fullName = this._repo.getCategoryFullName(args.list[0]);
          this._cli.echoSuccess(`Displaying category [${fullName}]:`);
          category.forEach((pr, i) => {
            this._cli.echoInline(`  ${i} - `);
            this._utils.echoPrincess(pr);
          });
        }
      },
    },
    {
      selectors: ["get", "g"],
      description: "Selects a princess for you.",
      help: [
        "Displays the selection message as well as some info about the princess.",
        "Supports shortened names and id positions.",
        "Syntax:",
        "  <selector> [category] [name|id]",
        "Example usage:",
        "  get young twilight",
        "  g e l",
        "  g y 2",
      ],
      actionAsync: async (args: CommandArgs) => {
        const princess = this._repo.getPrincess(
          this.category(args),
          this.princess(args),
        );

        this._cli.echoInline(`Yay! You've selected: `);
        this._utils.echoPrincess(princess);
      },
    },
    {
      selectors: ["getrnd", "gr"],
      description: "Selects a random princess for you.",
      help: [
        "Displays the selection message as well as some info about the princess.",
        "Doesn't accept any args.",
        "Syntax:",
        "  <selector>",
        "Example usage:",
        "  getrnd",
        "  gr",
      ],
      actionAsync: async (args: CommandArgs) => {
        const categoryName =
          args.list[0] !== "" && args.list[0] !== undefined
            ? this.category(args)
            : (this._repo
                .getCategoryNames()
                .at(
                  randomInt(0, this._repo.getCategoryNames().length - 1),
                ) as string);

        const category = this._repo.getCategory(categoryName);
        const princess = category[randomInt(category.length)];

        this._cli.echoWarn("You prey to the RNG powers...");
        this._cli.echoInline("Someone suddenly appeared: ");
        this._utils.echoPrincess(princess);
      },
    },
    {
      selectors: ["add", "a"],
      description: "Appends given princess to category.",
      help: [
        "Using princess dialogue creates new princess model and adds it to the end of given category. Some information about the princess may be omitted.",
        "Syntax:",
        "  <selector> [category] [new_name]",
        "Example usage:",
        "  add young Moonlight",
        "  a e Ash",
      ],
      actionAsync: async (args: CommandArgs) => {
        this.argsHaveCategory(args);
        const category = this._repo.getCategory(this.category(args));

        const newPrincess = await this._utils.princessDialogueAsync(
          this.category(args),
        );
        if (category.find((pr) => pr.commonName === newPrincess.commonName))
          throw new Error(
            `Princess [${newPrincess.commonName}] already exists.`,
          );

        await this._repo.addPrincessAsync(this.category(args), newPrincess);
      },
    },
    {
      selectors: ["remove", "rm"],
      description: "Removes given princess from category.",
      help: [
        "Changes the storage state to remove the given princess. Supports both name and id selection.",
        "Prompts the user before executing the operation.",
        "Syntax:",
        "  <selector> [category] [name|id]",
        "Example usage:",
        "  remove elder Celestia",
        "  rm e cad",
        "  rm y 1",
      ],
      actionAsync: async (args: CommandArgs) => {
        const categoryName = this.category(args);
        const princessName = this.princess(args);
        const princess = this._repo.getPrincess(categoryName, princessName);

        await this._utils.princessConfirmAsync("remove", princess.commonName);
        await this._repo.removePrincessAsync(categoryName, princessName);
      },
    },
    {
      selectors: ["change", "ch"],
      description: "Changes given princess to have other names.",
      help: [
        "Changes the storage state to modify the given princess in dialogue style. Some options may be omitted, uses old values in that case. Supports both name and id selection.",
        "Prompts the user before executing the operation.",
        "Syntax:",
        "  <selector> [category] [name|id]",
        "Example usage:",
        "  change young Fallenstar",
        "  ch e cel",
        "  ch y 0",
      ],
      actionAsync: async (args: CommandArgs) => {
        const princess = this._repo.getPrincess(
          this.category(args),
          this.princess(args),
        );

        const newPrincess = await this._utils.princessDialogueAsync(
          princess.commonName,
        );

        let noChanges = false;
        if (newPrincess.oldName == "") {
          newPrincess.oldName = princess.oldName;
          console.log("Using original [Old Name]");
          noChanges = true;
        }
        if (newPrincess.titles.length === 0) {
          newPrincess.titles = princess.titles;
          console.log("Using original [Titles]");
          if (noChanges) {
            this._cli.echoWarn("No changes, skipping.");
            return;
          }
        }

        await this._utils.princessConfirmAsync("change", princess.commonName);
        await this._repo.changePrincessAsync(
          this.category(args),
          princess.commonName,
          newPrincess,
        );
      },
    },
  ];

  private argsHaveCategory(args: CommandArgs) {
    if (args.list[0] === undefined || args.list[0] === "")
      throw new Error("Category argument is required.");
  }

  private argsHaveCategoryAndPrincess(args: CommandArgs) {
    this.argsHaveCategory(args);
    if (args.list[1] === undefined || args.list[1] === "")
      throw new Error("Princess argument is required.");
  }

  private category(args: CommandArgs): string {
    this.argsHaveCategory(args);
    return args.list[0];
  }

  private princess(args: CommandArgs): string {
    this.argsHaveCategoryAndPrincess(args);
    return args.list[1];
  }
}
