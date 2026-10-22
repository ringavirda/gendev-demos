import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const run = promisify(execFile);
const app = fileURLToPath(new URL("../src/app.js", import.meta.url));

const runWithInput = (args, input) =>
  new Promise((resolve, reject) => {
    const child = execFile(process.execPath, [app, ...args], (error, stdout) =>
      error ? reject(error) : resolve(stdout),
    );
    child.stdin.end(input);
  });

const runSelector = (file, input) =>
  new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      [app, "selector"],
      { env: { ...process.env, SELECTOR_DATA: file }, timeout: 5000 },
      (error, stdout, stderr) =>
        resolve({ code: error ? error.code : 0, stdout, stderr }),
    );
    child.stdin.end(input);
  });

describe("app arguments", () => {
  it("prints usage to stderr and exits 1 for an unknown option", async () => {
    const error = await run(process.execPath, [app, "--nope"]).catch((e) => e);
    expect(error.code).toBe(1);
    expect(error.stderr).toContain("Unknown option '--nope'");
    expect(error.stderr).toContain(
      "Usage: pnpm --filter @gendev/node-console start <example>",
    );
  });

  it("prints usage on --help and -h", async () => {
    for (const flag of ["--help", "-h"]) {
      const { stdout } = await run(process.execPath, [app, "selector", flag], {
        timeout: 5000,
      });
      expect(stdout).toContain(
        "Usage: pnpm --filter @gendev/node-console start <example>",
      );
    }
  });
});

describe("selector", () => {
  let dir;
  let file;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "selector-"));
    file = join(dir, "state.json");
  });

  afterEach(() => rm(dir, { recursive: true, force: true }));

  it("runs every piped line and keeps the change", async () => {
    const { code, stdout } = await runSelector(
      file,
      "a young Rarity\nls young\n",
    );
    expect(code).toBe(0);
    expect(stdout).toContain("  4 - Rarity");
    const saved = JSON.parse(await readFile(file, "utf8"));
    expect(saved.young.at(-1)).toBe("Rarity");
  });

  it("stops at q", async () => {
    const { code, stdout } = await runSelector(file, "q\nls\n");
    expect(code).toBe(0);
    expect(stdout).not.toContain("elder");
  });

  it("reports an emptied category", async () => {
    const input = "rm young 0\n".repeat(4) + "gr young\ng young 0\n";
    const { code, stdout, stderr } = await runSelector(file, input);
    expect(code).toBe(0);
    expect(stdout).toContain("Category [young] is empty.");
    expect(stderr).toContain("Id [0] is out of range for [young].");
  });

  it("exits 1 on a broken state file", async () => {
    await writeFile(file, "{");
    const { code, stderr } = await runSelector(file, "ls\n");
    expect(code).toBe(1);
    expect(stderr).toContain("Cannot read state file");
    expect(await readFile(file, "utf8")).toBe("{");
  });
});

describe("readline-events", () => {
  it("stops at q without a line event after the close", async () => {
    const stdout = await runWithInput(["readline-events"], "q\ny\ne\n");
    expect(stdout.match(/Bye!/g)).toHaveLength(1);
    expect(stdout).not.toContain("has selected you");
  });
});
