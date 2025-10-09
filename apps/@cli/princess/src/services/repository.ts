import { singleton } from "tsyringe";

import { CLI, JsonLoader } from "@cli/lib";
import { PrincessUtils } from "../utils";
import { KnownPrincesses, Princess, PrincessMap } from "../models/princess";

@singleton()
export class PrincessesRepository {
  private _state: PrincessMap = null!;

  constructor(
    private readonly _cli: CLI,
    private readonly _loader: JsonLoader,
    private readonly _utils: PrincessUtils,
  ) {}

  public async loadAsync(): Promise<void> {
    await this._loader.loadAsync();
    if (this._loader.getStateKey("princesses") === undefined) {
      this._loader.setStateKey("princesses", KnownPrincesses);
      this._loader.saveAsync();
    }
    this._state = this._loader.getStateKey<PrincessMap>("princesses");
  }

  // Category operations

  public getCategoryFullName(cat: string): string {
    const state = this._loader.getStateKey<PrincessMap>("princesses");
    const category = Array.from(state).find((category) =>
      category[0].startsWith(cat),
    );
    if (category === undefined) throw new Error(`Unknown category [${cat}].`);
    return category[0];
  }

  public getCategoryNames(): Array<string> {
    return [...this._loader.getStateKey<PrincessMap>("princesses").keys()];
  }

  public getCategory(cat: string): Array<Princess> {
    const fullName = this.getCategoryFullName(cat);
    return this._state.get(fullName) as Array<Princess>;
  }

  // Princess operations

  public getPrincess(cat: string, name: string): Princess {
    const category = this.getCategory(cat);
    const index = parseInt(name);

    // Name route.
    if (isNaN(index)) {
      const princess = category.find((pr) =>
        pr.commonName.toLowerCase().startsWith(name.toLowerCase()),
      );
      if (princess === undefined)
        throw new Error(`Unknown princess [${name}].`);
      return princess;
    }
    // Id route.
    else {
      if (index < 0 || index >= category.length)
        throw new Error(`Id [${index}] is invalid for category [${cat}].`);

      return category[index];
    }
  }

  public async addPrincessAsync(cat: string, pr: Princess): Promise<void> {
    const category = this.getCategory(cat);
    const fullName = this.getCategoryFullName(cat);
    category.push(pr);
    this._cli.echoSuccess(
      `Successfully added [${pr.commonName}] to category [${fullName}]`,
    );
    await this._loader.saveAsync();
  }

  public async removePrincessAsync(cat: string, name: string): Promise<void> {
    const category = this.getCategory(cat);
    const fullName = this.getCategoryFullName(cat);
    const princess = this.getPrincess(cat, name);

    const index = category.indexOf(princess);
    category.splice(index, 1);
    this._cli.echoWarn(
      `[${category[index].commonName}] is removed from category [${fullName}]`,
    );
    await this._loader.saveAsync();
  }

  public async changePrincessAsync(
    cat: string,
    name: string,
    newPr: Princess,
  ): Promise<void> {
    const category = this.getCategory(cat);
    const princess = this.getPrincess(cat, name);
    category[category.indexOf(princess)] = newPr;
    this._cli.echoWarn(`[${newPr.commonName}] is changed to:`);
    this._utils.echoPrincess(newPr);
    await this._loader.saveAsync();
  }
}
