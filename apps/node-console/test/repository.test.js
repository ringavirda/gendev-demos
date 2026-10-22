import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PrincessDict } from "../src/princesses.js";
import { PrincessRepository } from "../src/selector/repository.js";

describe("PrincessRepository", () => {
  let dir;
  let path;

  const loaded = async (file = path) => {
    const repository = new PrincessRepository(file);
    await repository.load();
    return repository;
  };

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "selector-"));
    path = join(dir, "s.json");
  });

  afterEach(() => rm(dir, { recursive: true, force: true }));

  it("starts from the defaults when the file is missing", async () => {
    const repository = await loaded();
    expect(repository.getCategoryNames()).toEqual(["elder", "young"]);
    expect(repository.getCategory("elder")).toEqual([
      "Celestia",
      "Luna",
      "Cadance",
    ]);
    expect(existsSync(path)).toBe(false);
  });

  it("keeps each change across a new load", async () => {
    const repository = await loaded();
    await repository.addPrincess("young", "Rarity");
    await repository.removePrincess("young", "0");
    expect(await repository.changePrincess("young", "Sunset", "Shimmer")).toBe(
      "Sunset",
    );

    const again = await loaded();
    expect(again.getCategory("young")).toEqual([
      "Shimmer",
      "Fallenstar",
      "Moonlight",
      "Rarity",
    ]);
    const data = JSON.parse(await readFile(path, "utf8"));
    expect(Array.isArray(data)).toBe(false);
    expect(Object.keys(data)).toEqual(["elder", "young"]);
  });

  it("returns copies", async () => {
    const repository = await loaded();
    repository.getCategory("young").push("Rarity");
    expect(repository.getCategory("young")).toHaveLength(4);

    await repository.addPrincess("young", "Rarity");
    expect(PrincessDict.get("young")).toEqual([
      "Twilight",
      "Sunset",
      "Fallenstar",
      "Moonlight",
    ]);
  });

  it("rejects bad words", async () => {
    const repository = await loaded();
    for (const word of ["-1", "1.5", "abc"]) {
      const message = `Unknown princess [${word}] in [young].`;
      expect(() => repository.getPrincess("young", word)).toThrow(message);
      await expect(repository.removePrincess("young", word)).rejects.toThrow(
        message,
      );
    }
    const range = "Id [10] is out of range for [young].";
    expect(() => repository.getPrincess("young", "10")).toThrow(range);
    await expect(repository.removePrincess("young", "10")).rejects.toThrow(
      range,
    );
    expect(() => repository.getPrincess("young", "4")).toThrow(
      "Id [4] is out of range for [young].",
    );
    expect(() => repository.getCategory("x")).toThrow("Unknown category [x].");
    await expect(repository.removePrincess("x", "0")).rejects.toThrow(
      "Unknown category [x].",
    );
    expect(existsSync(path)).toBe(false);
  });

  it("rejects duplicates and digit names", async () => {
    const repository = await loaded();
    await repository.addPrincess("young", "Luna");
    await expect(repository.addPrincess("young", "Sunset")).rejects.toThrow(
      "[Sunset] is already in [young].",
    );
    await expect(
      repository.changePrincess("young", "Twilight", "Sunset"),
    ).rejects.toThrow("[Sunset] is already in [young].");
    await expect(repository.addPrincess("young", "7")).rejects.toThrow(
      "A name cannot be only digits: [7].",
    );
    await expect(
      repository.changePrincess("young", "Twilight", "7"),
    ).rejects.toThrow("A name cannot be only digits: [7].");
    expect(repository.getCategory("young")).toEqual([
      "Twilight",
      "Sunset",
      "Fallenstar",
      "Moonlight",
      "Luna",
    ]);
  });

  it("throws on a broken file and leaves it", async () => {
    for (const bytes of [
      "{",
      "[]",
      '{"young": [1]}',
      "null",
      "5",
      '{"young": "Twilight"}',
    ]) {
      await writeFile(path, bytes);
      await expect(loaded()).rejects.toThrow(`Cannot read state file ${path}:`);
      expect(await readFile(path, "utf8")).toBe(bytes);
    }
  });

  it("creates the folder on first save", async () => {
    const nested = join(dir, "new", "dir", "s.json");
    const repository = await loaded(nested);
    await repository.addPrincess("young", "Rarity");
    expect(existsSync(nested)).toBe(true);
  });
});
