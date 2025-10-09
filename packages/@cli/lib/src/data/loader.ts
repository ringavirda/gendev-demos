import { access, constants, mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { singleton } from "tsyringe";

import { CLI } from "../cli/cli.js";
import { MapFixes } from "./fixes.js";

@singleton()
export class JsonLoader {
  private _dirPath = join(import.meta.dirname, "data");
  private _fileName = "db.json";
  private _path = join(this._dirPath, this._fileName);

  private _state: object = {};

  constructor(private readonly _cli: CLI) {}

  public setStateKey<T>(key: string, value: T): void {
    (this._state as any)[key] = value;
  }

  public getStateKey<T>(key: string): T {
    return (this._state as any)[key] as T;
  }

  public removeStateKey(key: string): void {
    delete (this._state as any)[key];
  }

  public async loadAsync(): Promise<void> {
    try {
      await access(this._path, constants.F_OK);
      const data = await readFile(this._path);
      this._state = JSON.parse(data.toString(), MapFixes.reviver);
    } catch {
      this._cli.echoWarn(
        "State database is uninitialized! Creating empty db...",
      );
      await this.saveAsync();
    }
  }

  public async saveAsync(): Promise<void> {
    try {
      await access(this._dirPath);
    } catch {
      await mkdir(this._dirPath, { recursive: true });
    }
    await writeFile(this._path, JSON.stringify(this._state, MapFixes.replacer));
  }
}
