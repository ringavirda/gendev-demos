import Database from "better-sqlite3";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Category } from "../../src/model/category.js";
import { Princess } from "../../src/model/princess.js";
import { SqlitePrincessRepository } from "../../src/storage/sqliteRepository.js";
import { StorageError } from "../../src/storage/storageError.js";

describe("SqlitePrincessRepository", () => {
  let dir: string;
  let path: string;
  let opened: SqlitePrincessRepository[];

  beforeEach(async () => {
    opened = [];
    dir = await mkdtemp(join(tmpdir(), "princess-sqlite-"));
    path = join(dir, "princesses.db");
  });

  afterEach(async () => {
    for (const repository of opened) {
      repository.close();
    }
    await rm(dir, { recursive: true, force: true });
  });

  async function loaded(file: string): Promise<SqlitePrincessRepository> {
    const repository = new SqlitePrincessRepository(file);
    opened.push(repository);
    await repository.load();
    return repository;
  }

  it("seeds the defaults into empty tables", async () => {
    const repository = await loaded(":memory:");
    expect(await repository.categoryNames()).toEqual(["elder", "young"]);
    const elder = await repository.get("elder");
    expect(elder.princesses.map((p) => p.commonName.toString())).toEqual([
      "Celestia",
      "Luna",
      "Cadance",
    ]);
    const young = await repository.get("young");
    expect(young.princesses.map((p) => p.commonName.toString())).toEqual([
      "Sparkle",
      "Sunset",
      "Fallenstar",
    ]);
    expect(young.find("Sunset").oldName).toBe("Sunset Shimmer");
  });

  it("does not seed twice", async () => {
    await loaded(path);
    const second = await loaded(path);
    expect((await second.get("young")).size).toBe(3);
  });

  it("round trip keeps order and fields", async () => {
    const repository = await loaded(":memory:");
    const young = await repository.get("young");
    young.replace(young.find("Sunset").with({ titles: ["Demoness of Fire"] }));
    young.remove("Sparkle");
    young.add(
      Princess.of({
        commonName: "Moonlight",
        oldName: "Moon Light",
        titles: ["Guardian", "Dreamer"],
      }),
    );
    await repository.save(young);

    const again = await repository.get("young");
    expect(again.princesses.map((p) => p.commonName.toString())).toEqual([
      "Sunset",
      "Fallenstar",
      "Moonlight",
    ]);
    expect(again.find("Sunset").titles.list).toEqual(["Demoness of Fire"]);
    expect(again.find("Moonlight").oldName).toBe("Moon Light");
    expect(again.find("Moonlight").titles.list).toEqual([
      "Guardian",
      "Dreamer",
    ]);
  });

  it("an emptied category survives a restart", async () => {
    const first = await loaded(path);
    await first.save(new Category("elder"));

    const second = await loaded(path);
    expect(await second.categoryNames()).toEqual(["elder", "young"]);
    expect((await second.get("elder")).size).toBe(0);
  });

  it("creates a missing data folder", async () => {
    const nested = join(dir, "a", "b", "princesses.db");
    await loaded(nested);
    expect((await stat(nested)).isFile()).toBe(true);
  });

  it("rejects a titles column that is not a string list", async () => {
    await loaded(path);
    const database = new Database(path);
    database.exec(`UPDATE princesses SET titles = '{"a":1}'`);
    database.close();

    const repository = await loaded(path);
    const error = await repository.get("elder").catch((e) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.message).toContain(path);
    expect(error.message).toContain("expected array");
    expect(error.message).not.toContain(": :");
  });

  it("reads princesses by position", async () => {
    await loaded(path);
    const database = new Database(path);
    database.exec(
      "UPDATE princesses SET position = 2 - position WHERE category = 'elder'",
    );
    database.close();

    const repository = await loaded(path);
    const elder = await repository.get("elder");
    expect(elder.princesses.map((p) => p.commonName.toString())).toEqual([
      "Cadance",
      "Luna",
      "Celestia",
    ]);
  });

  it("rejects a file that is not a database", async () => {
    await writeFile(path, "this is plain text, not a database file at all\n");
    const error = await new SqlitePrincessRepository(path)
      .load()
      .catch((e) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.message).toContain(path);
  });
});
