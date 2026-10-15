import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Summoning, summon } from "../src/examples/emitter.js";
import {
  dataDir,
  loadWithCallbacks,
  loadWithPromises,
} from "../src/examples/files.js";

const withCallbacks = (dir) =>
  new Promise((resolve, reject) =>
    loadWithCallbacks(dir, (error, loaded) =>
      error ? reject(error) : resolve(new Map(loaded)),
    ),
  );

const withEvents = (category, delayMs) =>
  new Promise((resolve, reject) => {
    const summoning = new Summoning();
    const heard = [];
    summoning.on("princess", (name) => heard.push(name));
    summoning.on("done", (names) => resolve({ heard: [...heard], names }));
    summoning.on("error", reject);
    summoning.start(category, delayMs);
  });

describe("fs pair", () => {
  let dir;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "node-console-"));
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it("loads equal maps for data/", async () => {
    const callbacks = await withCallbacks(dataDir);
    const promises = await loadWithPromises(dataDir);
    expect(callbacks).toEqual(promises);
    expect(promises.get("elder")).toEqual(["Celestia", "Luna", "Cadance"]);
    expect(promises.size).toBe(2);
  });

  it("strips carriage returns from a CRLF file", async () => {
    await writeFile(join(dir, "crlf.txt"), "Luna\r\nCadance\r\n");
    const expected = new Map([["crlf", ["Luna", "Cadance"]]]);
    expect(await withCallbacks(dir)).toEqual(expected);
    expect(await loadWithPromises(dir)).toEqual(expected);
  });

  it("reports ENOENT for a missing dir", async () => {
    const missing = join(dir, "missing");
    await expect(withCallbacks(missing)).rejects.toMatchObject({
      code: "ENOENT",
    });
    await expect(loadWithPromises(missing)).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});

describe("emitter pair", () => {
  it("gives the same names in order for elder", async () => {
    const names = ["Celestia", "Luna", "Cadance"];
    const events = await withEvents("elder", 0);
    expect(events.heard).toEqual(names);
    expect(events.names).toEqual(names);
    expect(await summon("elder", 0)).toEqual(names);
  });

  it("reports an unknown category the same way", async () => {
    const message = "Unknown category: nobody";
    await expect(withEvents("nobody", 0)).rejects.toThrow(message);
    await expect(summon("nobody", 0)).rejects.toThrow(message);
  });
});
