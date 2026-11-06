import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigError, loadConfig } from "../../src/app/config.js";

const packageFolder = resolve(import.meta.dirname, "../..");

describe("loadConfig", () => {
  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue(tmpdir());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to json, warn and a file in the package folder", () => {
    expect(loadConfig({})).toEqual({
      storage: "json",
      dataPath: resolve(packageFolder, "data/princesses.json"),
      logLevel: "warn",
    });
  });

  it("the sqlite default is princesses.db", () => {
    expect(loadConfig({ PRINCESS_STORAGE: "sqlite" }).dataPath).toBe(
      resolve(packageFolder, "data/princesses.db"),
    );
  });

  it("rejects a bad value naming the variable", () => {
    expect(() => loadConfig({ PRINCESS_STORAGE: "mongo" })).toThrow(
      ConfigError,
    );
    expect(() => loadConfig({ PRINCESS_STORAGE: "mongo" })).toThrow(
      /^PRINCESS_STORAGE:/,
    );
    expect(() => loadConfig({ LOG_LEVEL: "verbose" })).toThrow(/^LOG_LEVEL:/);
  });

  it("empty values count as unset", () => {
    expect(
      loadConfig({ PRINCESS_STORAGE: "", LOG_LEVEL: "", PRINCESS_DATA: "" }),
    ).toEqual(loadConfig({}));
  });

  it("a relative PRINCESS_DATA resolves against the cwd", () => {
    expect(loadConfig({ PRINCESS_DATA: "x/p.json" }).dataPath).toBe(
      resolve(tmpdir(), "x/p.json"),
    );
  });
});
