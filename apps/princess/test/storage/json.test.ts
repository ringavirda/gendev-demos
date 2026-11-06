import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Category } from "../../src/model/category.js";
import { NotFoundError } from "../../src/model/errors.js";
import { Princess } from "../../src/model/princess.js";
import { JsonPrincessRepository } from "../../src/storage/jsonRepository.js";
import { StorageError } from "../../src/storage/storageError.js";

describe("JsonPrincessRepository", () => {
  let dir: string;
  let path: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "princess-json-"));
    path = join(dir, "princesses.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  async function loaded(): Promise<JsonPrincessRepository> {
    const repository = new JsonPrincessRepository(path);
    await repository.load();
    return repository;
  }

  async function names(repository: JsonPrincessRepository, category: string) {
    return (await repository.get(category)).princesses.map((p) =>
      p.commonName.toString(),
    );
  }

  it("writes the defaults when the file is missing", async () => {
    await loaded();
    const stored = JSON.parse(await readFile(path, "utf8"));
    expect(Object.keys(stored.categories)).toEqual(["elder", "young"]);
    expect(
      stored.categories.elder.map((p: { commonName: string }) => p.commonName),
    ).toEqual(["Celestia", "Luna", "Cadance"]);
    expect(stored.categories.elder[0].oldName).toBe("Celestia");
  });

  it("round trip keeps order and fields", async () => {
    const first = await loaded();
    const young = await first.get("young");
    young.add(
      Princess.of({
        commonName: "Moonlight",
        oldName: "Moon Light",
        titles: ["Guardian", "Dreamer"],
      }),
    );
    await first.save(young);

    const second = await loaded();
    const again = await second.get("young");
    expect(again.princesses.map((p) => p.commonName.toString())).toEqual([
      "Sparkle",
      "Sunset",
      "Fallenstar",
      "Moonlight",
    ]);
    const moonlight = again.find("Moonlight");
    expect(moonlight.oldName).toBe("Moon Light");
    expect(moonlight.titles.list).toEqual(["Guardian", "Dreamer"]);
  });

  it("rejects a file that fails the schema with the path and the first issue", async () => {
    await writeFile(
      path,
      JSON.stringify({
        categories: { young: [{ commonName: 1, titles: [] }] },
      }),
    );
    const error = await new JsonPrincessRepository(path).load().catch((e) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.message).toContain(path);
    expect(error.message).toContain("categories.young.0.commonName");
  });

  it("rejects a file that is not JSON", async () => {
    await writeFile(path, "{");
    const error = await new JsonPrincessRepository(path).load().catch((e) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.message).toContain(path);
  });

  it("rejects stored data the model refuses", async () => {
    const stored = (categories: unknown) =>
      writeFile(path, JSON.stringify({ categories }));

    await stored({
      elder: [
        { commonName: "Luna", titles: [] },
        { commonName: "Luna", titles: [] },
      ],
    });
    const duplicate = await new JsonPrincessRepository(path)
      .load()
      .catch((e) => e);
    expect(duplicate).toBeInstanceOf(StorageError);
    expect(duplicate.message).toContain(path);

    await stored({ elder: [{ commonName: "", titles: [] }] });
    const empty = await new JsonPrincessRepository(path).load().catch((e) => e);
    expect(empty).toBeInstanceOf(StorageError);
    expect(empty.message).toContain(path);
  });

  it("creates a missing data folder", async () => {
    const nested = join(dir, "a", "b", "princesses.json");
    await new JsonPrincessRepository(nested).load();
    expect(JSON.parse(await readFile(nested, "utf8")).categories).toBeDefined();
  });

  it("an emptied category survives a restart", async () => {
    const first = await loaded();
    await first.save(new Category("elder"));

    const second = await loaded();
    expect(await second.categoryNames()).toEqual(["elder", "young"]);
    expect((await second.get("elder")).size).toBe(0);
  });

  it("get resolves a typed prefix and rejects an unknown one", async () => {
    const repository = await loaded();
    expect(await names(repository, "YO")).toEqual([
      "Sparkle",
      "Sunset",
      "Fallenstar",
    ]);
    await expect(repository.get("old")).rejects.toBeInstanceOf(NotFoundError);
  });
});
