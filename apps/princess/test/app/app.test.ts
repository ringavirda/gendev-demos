import "reflect-metadata";
import { PassThrough, Readable } from "node:stream";
import { stripVTControlCharacters } from "node:util";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CLI } from "@gendev/cli-lib";
import { resolveApp, createContainer } from "../../src/app/container.js";
import { REPOSITORY } from "../../src/services/ports.js";
import { StorageError } from "../../src/storage/storageError.js";
import { MemoryPrincessRepository } from "../fakes/memoryRepository.js";

describe("App", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "princess-app-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  function setup() {
    const container = createContainer({
      storage: "json",
      dataPath: join(dir, "p.json"),
      logLevel: "warn",
    });
    const out = new PassThrough();
    const err = new PassThrough();
    container.rebind(CLI).toConstantValue(new CLI(Readable.from([]), out, err));
    const text = (stream: PassThrough) =>
      stripVTControlCharacters(stream.read()?.toString() ?? "");
    return { container, stdout: () => text(out), stderr: () => text(err) };
  }

  it("run loads, runs one line and returns its exit code", async () => {
    const { container, stdout } = setup();
    expect(await resolveApp(container).run(["get", "young", "sparkle"])).toBe(
      0,
    );
    expect(stdout()).toContain(
      "Yay! You've selected: Sparkle (Twilight Sparkle)",
    );
    const second = setup();
    expect(await resolveApp(second.container).run(["nope"])).toBe(2);
  });

  it("a storage error at load prints it and returns 1", async () => {
    const { container, stderr } = setup();
    const broken = new MemoryPrincessRepository();
    broken.load = () => Promise.reject(new StorageError("/x/p.json", "bad"));
    container.rebind(REPOSITORY).toConstantValue(broken);
    expect(await resolveApp(container).run(["ls"])).toBe(1);
    expect(stderr()).toContain("Cannot read /x/p.json: bad");
  });
});
