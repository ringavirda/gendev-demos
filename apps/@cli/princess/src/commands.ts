import { singleton } from "tsyringe";
import { randomInt } from "node:crypto";

import { CArgs, CLI, Command } from "@cli/lib";
import { PrincessesEntity } from "./models";
import { PrincessUtils } from "./utils";

@singleton()
export class PrincessCommands {
  constructor(
    private readonly _cli: CLI,
    private readonly _entity: PrincessesEntity,
    private readonly _utils: PrincessUtils,
  ) {}

  public readonly commandList: Array<Command> = [
    {
      selectors: ["list", "ls"],
      actionAsync: async (cArgs: CArgs) => {
        const categories = this._entity.getCategoryNames();
        const category = cArgs.args[0] ?? "";
        if (category === "") {
          this._cli.echoSuccess("Displaying available categories:");
          categories.forEach((cat) => this._cli.echo(` - ${cat}`));
        } else {
          const category = this._entity.getCategory(cArgs.args[0]);
          const fullName = this._entity.getCategoryFullName(cArgs.args[0]);
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
      actionAsync: async (cArgs: CArgs) => {
        const princess = this._entity.getPrincess(
          this.category(cArgs),
          this.princess(cArgs),
        );

        this._cli.echoInline(`Yay! You've selected: `);
        this._utils.echoPrincess(princess);
      },
    },
    {
      selectors: ["getrnd", "gr"],
      actionAsync: async (cArgs: CArgs) => {
        const categoryName =
          cArgs.args[0] !== "" && cArgs.args[0] !== undefined
            ? this.category(cArgs)
            : (this._entity
                .getCategoryNames()
                .at(
                  randomInt(0, this._entity.getCategoryNames().length - 1),
                ) as string);

        const category = this._entity.getCategory(categoryName);

        this._cli.echoWarn("You prey to the RNG powers...");
        this._cli.echoInline("Someone suddenly appeared: ");
        this._cli.echoSuccess(category[randomInt(category.length)].oldName);
      },
    },
    {
      selectors: ["add", "a"],
      actionAsync: async (cArgs: CArgs) => {
        this.argsHaveCategory(cArgs);
        const category = this._entity.getCategory(this.category(cArgs));

        const newPrincess = await this._utils.princessDialogueAsync(
          this.category(cArgs),
        );
        if (category.find((pr) => pr.commonName === newPrincess.commonName))
          throw new Error(
            `Princess [${newPrincess.commonName}] already exists.`,
          );

        await this._entity.addPrincessAsync(this.category(cArgs), newPrincess);
      },
    },
    {
      selectors: ["remove", "rm"],
      actionAsync: async (cArgs: CArgs) => {
        await this._entity.removePrincessAsync(
          this.category(cArgs),
          this.princess(cArgs),
        );
      },
    },
    {
      selectors: ["change", "ch"],
      actionAsync: async (cArgs: CArgs) => {
        const princess = this._entity.getPrincess(
          this.category(cArgs),
          this.princess(cArgs),
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

        await this._entity.changePrincessAsync(
          this.category(cArgs),
          princess.commonName,
          newPrincess,
        );
      },
    },
  ];

  private argsHaveCategory(cArgs: CArgs) {
    if (cArgs.args[0] === undefined || cArgs.args[0] === "")
      throw new Error("Category argument is required.");
  }

  private argsHaveCategoryAndPrincess(cArgs: CArgs) {
    this.argsHaveCategory(cArgs);
    if (cArgs.args[1] === undefined || cArgs.args[1] === "")
      throw new Error("Princess argument is required.");
  }

  private category(cArgs: CArgs): string {
    this.argsHaveCategory(cArgs);
    return cArgs.args[0];
  }

  private princess(cArgs: CArgs): string {
    this.argsHaveCategoryAndPrincess(cArgs);
    return cArgs.args[1];
  }
}
